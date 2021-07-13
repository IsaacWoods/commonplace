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
    Image { src: String },
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
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Mark {
    Bold,
    Italic,
    Strikethrough,
    Highlight,
    // TODO: explore making `Link` its own type of `Inline`. This has advantages in the persisted format.
    Link { href: String },
}

impl From<record::ZettelRecord> for Zettel {
    fn from(record: record::ZettelRecord) -> Zettel {
        Zettel {
            title: record.title,
            content: record.content.into_iter().map(|block| Block::from(block)).collect(),
        }
    }
}

impl From<record::Block> for Block {
    fn from(block: record::Block) -> Block {
        match block {
            record::Block::Paragraph { inlines } => {
                Block::Paragraph { inlines: inlines.into_iter().map(|inline| Inline::from(inline)).collect() }
            }
            record::Block::Heading { level, inlines } => {
                Block::Heading { level, inlines: inlines.into_iter().map(|inline| Inline::from(inline)).collect() }
            }
            record::Block::Image { src } => Block::Image { src },
            record::Block::Divider => Block::Divider,
            record::Block::List { items } => {
                Block::List { items: items.into_iter().map(|item| ListItem::from(item)).collect() }
            }
        }
    }
}

impl From<record::ListItem> for ListItem {
    fn from(item: record::ListItem) -> ListItem {
        ListItem { blocks: item.blocks.into_iter().map(|block| Block::from(block)).collect() }
    }
}

impl From<record::Inline> for Inline {
    fn from(inline: record::Inline) -> Inline {
        match inline {
            record::Inline::Text { text, marks } => {
                Inline::Text { text, marks: marks.into_iter().map(|mark| Mark::from(mark)).collect() }
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
            record::Mark::Link { href } => Mark::Link { href },
        }
    }
}
