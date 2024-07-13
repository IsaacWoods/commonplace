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
    pub content: ZettelContent,
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
        Some(record) => Ok(Json(FoundZettel { title: record.title, content: record.content })),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn list(State(state): State<Arc<AppState>>) -> Result<Json<Vec<QueryResult>>, StatusCode> {
    let all = state
        .store
        .all()
        .into_iter()
        .map(|(id, record)| QueryResult { id, title: record.title, content: record.content })
        .collect();
    Ok(Json(all))
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
    pub content: ZettelContent,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ZettelUpdate {
    pub title: String,
    pub content: ZettelContent,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ZettelContent {
    Doc { content: Vec<Block> },
}

impl ZettelContent {
    pub fn empty() -> ZettelContent {
        Self::Doc { content: Vec::new() }
    }
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
    TaskList { content: Option<Vec<Block>> },
    TaskItem { attrs: TaskItemAttrs, content: Option<Vec<Block>> },
    Table { content: Option<Vec<Block>> },
    TableRow { content: Option<Vec<Block>> },
    TableHeader { attrs: TableAttrs, content: Option<Vec<Block>> },
    TableCell { attrs: TableAttrs, content: Option<Vec<Block>> },
    Image { attrs: ImageAttrs },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HeadingAttrs {
    pub level: usize,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TaskItemAttrs {
    checked: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TableAttrs {
    pub colspan: usize,
    pub rowspan: usize,
    pub colwidth: Option<Vec<usize>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ImageAttrs {
    src: String,
    alt: Option<String>,
    title: Option<String>,
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
    Link { attrs: LinkAttrs },
    Superscript,
    Subscript,
    Highlight { color: Option<String> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LinkAttrs {
    pub href: String,
    pub target: String,
    pub rel: String,
}
