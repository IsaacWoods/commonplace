use crate::record;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Zettel {
    pub title: String,
    pub content: Vec<Block>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Block {
    Paragraph { inlines: Vec<Inline> },
    Heading { level: u8, inlines: Vec<Inline> },
    Image { src: String, alt: String },
    Divider,
    List { items: Vec<ListItem> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ListItem {
    pub blocks: Vec<Block>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Inline {
    Text { text: String, marks: Vec<Mark> },
    Link { text: String, href: String, marks: Vec<Mark> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Mark {
    Bold,
    Italic,
    Strikethrough,
    Highlight,
    Subscript,
    Superscript,
}

impl From<record::ZettelRecord> for Zettel {
    fn from(record: record::ZettelRecord) -> Zettel {
        Zettel { title: record.title, content: record.content.into_iter().map(Block::from).collect() }
    }
}

impl From<record::Block> for Block {
    fn from(block: record::Block) -> Block {
        match block {
            record::Block::Paragraph { inlines } => {
                Block::Paragraph { inlines: inlines.into_iter().map(Inline::from).collect() }
            }
            record::Block::Heading { level, inlines } => {
                Block::Heading { level, inlines: inlines.into_iter().map(Inline::from).collect() }
            }
            record::Block::Image { src, alt } => Block::Image { src, alt },
            record::Block::Divider => Block::Divider,
            record::Block::List { items } => {
                Block::List { items: items.into_iter().map(ListItem::from).collect() }
            }
        }
    }
}

impl From<record::ListItem> for ListItem {
    fn from(item: record::ListItem) -> ListItem {
        ListItem { blocks: item.blocks.into_iter().map(Block::from).collect() }
    }
}

impl From<record::Inline> for Inline {
    fn from(inline: record::Inline) -> Inline {
        match inline {
            record::Inline::Text { text, marks } => {
                Inline::Text { text, marks: marks.into_iter().map(Mark::from).collect() }
            }
            record::Inline::Link { text, href, marks } => {
                Inline::Link { text, href, marks: marks.into_iter().map(Mark::from).collect() }
            }
        }
    }
}

impl From<record::Mark> for Mark {
    fn from(mark: record::Mark) -> Mark {
        match mark {
            record::Mark::Bold => Mark::Bold,
            record::Mark::Italic => Mark::Italic,
            record::Mark::Strikethrough => Mark::Strikethrough,
            record::Mark::Highlight => Mark::Highlight,
            record::Mark::Subscript => Mark::Subscript,
            record::Mark::Superscript => Mark::Superscript,
        }
    }
}
