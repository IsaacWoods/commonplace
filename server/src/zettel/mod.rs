mod index;

use commonplace::{content::Block, Zettel, ZettelId};
use index::Index;
use rocket::{get, http::Status, post, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use std::{convert::TryInto, ops::Deref};

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    pub id: ZettelId,
    pub title: String,
    pub content: Vec<Block>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ZettelUpdate {
    pub title: Option<String>,
    pub content: Option<Vec<Block>>,
}

pub struct ZettelStore {
    tree: sled::Tree,
    index: Index,
}

impl ZettelStore {
    pub fn new() -> ZettelStore {
        ZettelStore { tree: sled::open("db").unwrap().open_tree("zettels").unwrap(), index: Index::create() }
    }

    pub fn create(&self) -> ZettelId {
        // TODO: detect duplicate IDs being generated properly
        let id = ZettelId::generate();
        self.tree
            .compare_and_swap(
                &id.encode(),
                None: Option<&[u8]>,
                Some(serde_cbor::to_vec(&Zettel::default()).unwrap()),
            )
            .unwrap()
            .expect("Failed to create Zettel!");
        id
    }

    pub fn get(&self, id: ZettelId) -> Option<Zettel> {
        self.tree.get(id.encode()).unwrap().map(|bytes| serde_cbor::from_slice(&bytes).unwrap())
    }

    pub fn all(&self) -> Vec<QueryResult> {
        self.tree
            .iter()
            .filter_map(|entry| {
                if let Ok((key, value)) = entry {
                    let id = ZettelId::decode(key.deref().try_into().unwrap());
                    let zettel = serde_cbor::from_slice::<Zettel>(&value).unwrap();
                    Some(QueryResult { id, title: zettel.title, content: zettel.content })
                } else {
                    println!("Weird entry when iterating Zettels: {:?}", entry);
                    None
                }
            })
            .collect()
    }

    pub fn search(&self, query: &str) {
        self.index.search(query)
    }

    pub fn update(&self, id: ZettelId, update: ZettelUpdate) {
        self.tree
            .update_and_fetch(&id.encode(), |old| {
                let mut zettel: Zettel = serde_cbor::from_slice(old.unwrap()).unwrap();

                if let Some(ref title) = &update.title {
                    zettel.title = title.clone();
                }

                if let Some(ref content) = &update.content {
                    zettel.content = content.clone();
                }

                self.index.update_zettel(id, &zettel);

                Some(serde_cbor::to_vec(&zettel).unwrap())
            })
            .unwrap();
    }
}

#[post("/zettel.create")]
pub fn create(store: &State<ZettelStore>) -> Result<Json<ZettelId>, ()> {
    let id = store.create();
    Ok(Json(id))
}

#[get("/zettel.fetch/<id>")]
pub fn fetch(id: u64, store: &State<ZettelStore>) -> Result<Json<Zettel>, Status> {
    match store.get(ZettelId(id)) {
        Some(zettel) => Ok(Json(zettel)),
        None => Err(Status::NotFound),
    }
}

#[get("/zettel.list")]
pub fn list(store: &State<ZettelStore>) -> Result<Json<Vec<QueryResult>>, Status> {
    Ok(Json(store.all()))
}

#[get("/zettel.search?<query>")]
pub fn search(query: Option<String>, store: &State<ZettelStore>) -> Result<Json<Vec<QueryResult>>, Status> {
    if let Some(query) = query {
        store.search(&query);
    }

    Ok(Json(store.all()))
}

#[post("/zettel.update/<id>", format = "json", data = "<update>")]
pub fn update(id: u64, update: Json<ZettelUpdate>, store: &State<ZettelStore>) -> Result<(), ()> {
    store.update(ZettelId(id), update.into_inner());
    Ok(())
}
