use super::index::Index;
use commonplace::{
    record::{Block, ZettelRecord},
    ZettelId,
};
use std::{convert::TryInto, ops::Deref, sync::Arc};

pub struct ZettelStore {
    tree: sled::Tree,
    index: Arc<Index>,
}

impl ZettelStore {
    pub fn new(index: Arc<Index>) -> ZettelStore {
        ZettelStore { tree: sled::open("db").unwrap().open_tree("zettels").unwrap(), index }
    }

    pub fn create(&self) -> ZettelId {
        let id = ZettelId::generate();

        // TODO: proper error for accidently generating duplicate IDs
        self.tree
            .compare_and_swap(&id.encode(), None: Option<&[u8]>, Some(ZettelRecord::default().serialize()))
            .unwrap()
            .expect("Failed to create Zettel!");
        id
    }

    pub fn get(&self, id: ZettelId) -> Option<ZettelRecord> {
        self.tree.get(id.encode()).unwrap().map(|bytes| ZettelRecord::deserialize(&bytes).unwrap())
    }

    pub fn all(&self) -> Vec<(ZettelId, ZettelRecord)> {
        self.tree
            .iter()
            .filter_map(|entry| {
                if let Ok((key, value)) = entry {
                    let id = ZettelId::decode(key.deref().try_into().unwrap());
                    let zettel = ZettelRecord::deserialize(&value).unwrap();
                    Some((id, zettel))
                } else {
                    println!("Weird entry when iterating Zettels: {:?}", entry);
                    None
                }
            })
            .collect()
    }

    pub fn search(&self, query: &str) -> Vec<ZettelId> {
        self.index.search(query)
    }

    pub fn update(&self, id: ZettelId, new_title: Option<String>, new_content: Option<Vec<Block>>) {
        self.tree
            .update_and_fetch(&id.encode(), |old| {
                let mut zettel = ZettelRecord::deserialize(old.unwrap()).unwrap();

                if let Some(ref title) = &new_title {
                    zettel.title = title.clone();
                }

                if let Some(ref content) = &new_content {
                    zettel.content = content.clone();
                }

                self.index.update_zettel(id, &zettel);

                Some(zettel.serialize())
            })
            .unwrap();
    }
}
