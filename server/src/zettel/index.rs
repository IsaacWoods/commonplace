use commonplace::{record::ZettelRecord, ZettelId};
use std::{
    path::Path,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
        Mutex,
    },
};
use tantivy::{
    collector::TopDocs,
    directory::MmapDirectory,
    doc,
    query::QueryParser,
    schema::{Field, Schema, Term, FAST, INDEXED, STORED, TEXT},
    Index as TantivyIndex,
    IndexWriter,
};

struct Fields {
    id: Field,
    title: Field,
    content: Field,
}

pub struct Index {
    pub commit_needed: AtomicBool,
    index: TantivyIndex,
    fields: Fields,
    index_writer: Mutex<IndexWriter>,
    query_parser: QueryParser,
}

impl Index {
    pub fn create() -> Index {
        let mut schema_builder = Schema::builder();
        let id = schema_builder.add_u64_field("id", INDEXED | FAST | STORED);
        let title = schema_builder.add_text_field("title", TEXT);
        let content = schema_builder.add_text_field("content", TEXT);
        let schema = schema_builder.build();

        let index =
            TantivyIndex::open_or_create(MmapDirectory::open(Path::new("index/")).unwrap(), schema).unwrap();
        let writer = index.writer(10_000_000).unwrap();
        let query_parser = QueryParser::for_index(&index, vec![title, content]);

        Index {
            commit_needed: AtomicBool::new(false),
            index,
            fields: Fields { id, title, content },
            index_writer: Mutex::new(writer),
            query_parser,
        }
    }

    pub fn update_zettel(&self, id: ZettelId, new: &ZettelRecord) {
        let index_writer = self.index_writer.lock().unwrap();
        index_writer.delete_term(Term::from_field_u64(self.fields.id, id.0));
        index_writer.add_document(tantivy::doc!(
            self.fields.id => id.0,
            self.fields.title => new.title.clone(),
            self.fields.content => "",
        ));

        self.commit_needed.store(true, Ordering::SeqCst);
    }

    pub fn search(&self, query: &str) -> Vec<ZettelId> {
        let reader = self.index.reader().unwrap();
        let searcher = reader.searcher();
        let query = self.query_parser.parse_query(query).unwrap();
        let top_docs = searcher.search(&query, &TopDocs::with_limit(10)).unwrap();

        top_docs
            .iter()
            .map(|(_score, doc_address)| {
                let doc = searcher.doc(*doc_address).unwrap();
                ZettelId(doc.get_first(self.fields.id).unwrap().u64_value().unwrap())
            })
            .collect()
    }
}

/// Committing the index is way too slow to be doing on every Zettel update, as it pushes up the response time of
/// update requests. Instead, we run a background task that periodically commits the index if needed - search
/// results are not available until this happens, but I think that's okay for our purposes.
pub async fn commit_index(index: Arc<Index>) {
    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(60));
    loop {
        interval.tick().await;
        if index.commit_needed.compare_exchange(true, false, Ordering::SeqCst, Ordering::SeqCst).is_ok() {
            index.index_writer.lock().unwrap().commit().unwrap();
        }
    }
}
