use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use commonplace::ZettelId;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tracing::{error, info};

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    pub id: ZettelId,
    pub title: String,
    // TODO: proper schema
    pub content: serde_json::Value,
}

pub async fn create(State(state): State<Arc<AppState>>) -> Result<Json<ZettelId>, StatusCode> {
    match state.store.create() {
        Some(id) => Ok(Json(id)),
        None => Err(StatusCode::TOO_MANY_REQUESTS),
    }
}

pub async fn fetch(
    State(state): State<Arc<AppState>>,
    Path(id): Path<ZettelId>,
) -> Result<Json<FoundZettel>, StatusCode> {
    match state.store.get(id) {
        Some(record) => Ok(Json(FoundZettel { title: record.title, content: record.content.content })),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn list(State(state): State<Arc<AppState>>) -> Result<Json<Vec<QueryResult>>, StatusCode> {
    // TODO
    Ok(Json(vec![]))
}

pub async fn search(State(state): State<Arc<AppState>>, Query(query): Query<String>) -> impl IntoResponse {
    todo!()
}

pub async fn update(
    State(state): State<Arc<AppState>>,
    Path(id): Path<ZettelId>,
    update: String,
) -> Result<(), StatusCode> {
    info!("Update for path: {:?}, update = {:#?}", id, update);

    match serde_json::from_str(&update) {
        Ok(update) => state.store.update(id, update),
        Err(err) => error!("Error parsing Zettel update: {:?}", err),
    }

    Ok(())
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FoundZettel {
    pub title: String,
    pub content: Vec<Block>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ZettelUpdate {
    pub title: Option<String>,
    pub content: Option<ZettelContent>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ZettelContent {
    /*
     * When a Zettel is empty, the JSON contains an empty sequence for `ZettelContent`. We tell
     * Serde to deserialize this as the default value, so this doesn't trip it up.
     * TODO: this doesn't work lmao
     */
    #[serde(default)]
    pub content: Vec<Block>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Block {
    Paragraph { content: Option<Vec<Inline>> },
    Blockquote { content: Option<Vec<Block>> },
    BulletList { content: Option<Vec<Block>> },
    CodeBlock { content: Option<Vec<Inline>> },
    Heading { attrs: HeadingAttrs, content: Option<Vec<Inline>> },
    HorizontalRule,
    ListItem { content: Option<Vec<Block>> },
    OrderedList { content: Option<Vec<Block>> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HeadingAttrs {
    pub level: usize,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Inline {
    Text { text: String, marks: Option<Vec<Mark>> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Mark {
    Bold,
    Italic,
    Strike,
    Code,
}
