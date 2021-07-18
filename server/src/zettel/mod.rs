pub mod index;
mod store;

pub use index::Index;
pub use store::ZettelStore;

use commonplace::{
    endpoint::{Block, Zettel},
    ZettelId,
};
use rocket::{get, http::Status, post, serde::json::Json, State};
use serde::{Deserialize, Serialize};

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

#[post("/zettel.create")]
pub fn create(store: &State<ZettelStore>) -> Result<Json<ZettelId>, ()> {
    let id = store.create();
    Ok(Json(id))
}

#[get("/zettel.fetch/<id>")]
pub fn fetch(id: u64, store: &State<ZettelStore>) -> Result<Json<Zettel>, Status> {
    match store.get(ZettelId(id)) {
        Some(zettel_record) => Ok(Json(Zettel::from(zettel_record))),
        None => Err(Status::NotFound),
    }
}

#[get("/zettel.list")]
pub fn list(store: &State<ZettelStore>) -> Result<Json<Vec<QueryResult>>, Status> {
    Ok(Json(
        store
            .all()
            .iter()
            .map(|(id, record)| QueryResult {
                id: *id,
                title: record.title.clone(),
                content: record.content.clone().into_iter().map(Into::into).collect(),
            })
            .collect(),
    ))
}

#[get("/zettel.search?<query>")]
pub fn search(query: Option<String>, store: &State<ZettelStore>) -> Result<Json<Vec<ZettelId>>, Status> {
    if let Some(query) = query {
        Ok(Json(store.search(&query)))
    } else {
        Ok(Json(Vec::new()))
    }
}

#[post("/zettel.update/<id>", format = "json", data = "<update>")]
pub fn update(id: u64, update: Json<ZettelUpdate>, store: &State<ZettelStore>) -> Result<(), ()> {
    let update = update.into_inner();
    store.update(
        ZettelId(id),
        update.title,
        update.content.map(|content| content.into_iter().map(Into::into).collect()),
    );
    Ok(())
}
