use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Block {
    Paragraph { inlines: Vec<Inline> },
    Heading { level: u8, inlines: Vec<Inline> },
    Image { src: String },
    Divider,
    List { items: Vec<ListItem> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ListItem {
    blocks: Vec<Block>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Inline {
    Text { text: String, marks: Vec<Mark> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Mark {
    Bold,
    Italic,
    Strikethrough,
    Highlight,
    Link { href: String },
}
