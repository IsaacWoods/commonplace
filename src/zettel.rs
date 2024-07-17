use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
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

#[derive(Clone, Debug, Deserialize)]
pub struct SearchParams {
    query: String,
}

pub async fn search(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchParams>,
) -> Result<Json<Vec<ZettelId>>, StatusCode> {
    let result = state.index.search(&params.query);
    Ok(Json(result))
}

pub async fn update(
    State(state): State<Arc<AppState>>,
    Path(id): Path<ZettelId>,
    update: String,
) -> Result<(), StatusCode> {
    match serde_json::from_str(&update) {
        Ok(update) => {
            state.store.update(id, update);
            state.index.update_zettel(id, &state.store.get(id).unwrap());
        }
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

    pub fn index(&self) -> String {
        let mut result = String::new();

        match self {
            Self::Doc { content } => {
                for block in content {
                    block.append_indexed(&mut result);
                }
            }
        }

        result
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Block {
    Paragraph { content: Option<Vec<Inline>> },
    Blockquote { content: Option<Vec<Block>> },
    BulletList { content: Option<Vec<Block>> },
    CodeBlock { attrs: CodeBlockAttrs, content: Option<Vec<Inline>> },
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
    Details { attrs: DetailsAttrs, content: Option<Vec<Block>> },
    DetailsSummary { content: Option<Vec<Inline>> },
    DetailsContent { content: Option<Vec<Block>> },
}

impl Block {
    fn append_indexed(&self, s: &mut String) {
        match self {
            Block::Paragraph { content } => {
                if let Some(content) = content {
                    for inline in content {
                        inline.append_indexed(s);
                    }
                }
            }
            Block::Blockquote { content } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::BulletList { content } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::CodeBlock { content, .. } => {
                if let Some(content) = content {
                    for inline in content {
                        inline.append_indexed(s);
                    }
                }
            }
            Block::Heading { content, .. } => {
                if let Some(content) = content {
                    for inline in content {
                        inline.append_indexed(s);
                    }
                }
            }
            Block::HorizontalRule => (),
            Block::ListItem { content } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::OrderedList { content } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::TaskList { content } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::TaskItem { content, .. } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::Table { content } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::TableRow { content } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::TableHeader { content, .. } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::TableCell { content, .. } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::Image { .. } => (),
            Block::Details { content, .. } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
            Block::DetailsSummary { content } => {
                if let Some(content) = content {
                    for inline in content {
                        inline.append_indexed(s);
                    }
                }
            }
            Block::DetailsContent { content } => {
                if let Some(content) = content {
                    for block in content {
                        block.append_indexed(s);
                    }
                }
            }
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CodeBlockAttrs {
    pub language: Option<String>,
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
pub struct DetailsAttrs {
    pub open: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Inline {
    Text { text: String, marks: Option<Vec<Mark>> },
    ZettelLink { attrs: ZettelLinkAttrs },
}

impl Inline {
    fn append_indexed(&self, s: &mut String) {
        match self {
            Inline::Text { text, .. } => {
                s.push_str(text);
                s.push(' ');
            }
            Inline::ZettelLink { .. } => (),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ZettelLinkAttrs {
    pub target: u64,
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
