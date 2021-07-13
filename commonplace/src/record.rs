use crate::endpoint;
use serde::{Deserialize, Serialize};

/// The first two bytes of a Zettel's value when persisted into the database will contain a version. This is to
/// allow us to change the format of Zettels and to migrate old Zettels to the new format. This version should be
/// incremented when:
///    - The format of the actual Zettel data is changed
///    - The format into which that data is serialized changes (either through a change of format, or a change in
///      version of that format (e.g. `bincode`'s encoding is not necessarily stable between non-minor versions, or
///      if the configuration changes)).
pub const CURRENT_ZETTEL_FORMAT_VERSION: u16 = 0;

#[derive(Clone, Default, Debug, Serialize, Deserialize)]
pub struct ZettelRecord {
    pub title: String,
    pub pinned: bool,
    pub content: Vec<Block>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
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
pub enum Inline {
    Text { text: String, marks: Vec<Mark> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Mark {
    Bold,
    Italic,
    Strikethrough,
    Highlight,
    // TODO: explore making `Link` its own type of `Inline`. Simple marks could then be a bitfield.
    Link { href: String },
}

impl From<endpoint::Zettel> for ZettelRecord {
    fn from(zettel: endpoint::Zettel) -> ZettelRecord {
        ZettelRecord {
            title: zettel.title,
            // TODO
            pinned: false,
            content: zettel.content.into_iter().map(|block| Block::from(block)).collect(),
        }
    }
}

impl From<endpoint::Block> for Block {
    fn from(block: endpoint::Block) -> Block {
        match block {
            endpoint::Block::Paragraph { inlines } => {
                Block::Paragraph { inlines: inlines.into_iter().map(|inline| Inline::from(inline)).collect() }
            }
            endpoint::Block::Heading { level, inlines } => {
                Block::Heading { level, inlines: inlines.into_iter().map(|inline| Inline::from(inline)).collect() }
            }
            endpoint::Block::Image { src } => Block::Image { src },
            endpoint::Block::Divider => Block::Divider,
            endpoint::Block::List { items } => {
                Block::List { items: items.into_iter().map(|item| ListItem::from(item)).collect() }
            }
        }
    }
}

impl From<endpoint::ListItem> for ListItem {
    fn from(item: endpoint::ListItem) -> ListItem {
        ListItem { blocks: item.blocks.into_iter().map(|block| Block::from(block)).collect() }
    }
}

impl From<endpoint::Inline> for Inline {
    fn from(inline: endpoint::Inline) -> Inline {
        match inline {
            endpoint::Inline::Text { text, marks } => {
                Inline::Text { text, marks: marks.into_iter().map(|mark| Mark::from(mark)).collect() }
            }
        }
    }
}

impl From<endpoint::Mark> for Mark {
    fn from(mark: endpoint::Mark) -> Mark {
        match mark {
            endpoint::Mark::Bold => Mark::Bold,
            endpoint::Mark::Italic => Mark::Italic,
            endpoint::Mark::Strikethrough => Mark::Strikethrough,
            endpoint::Mark::Highlight => Mark::Highlight,
            endpoint::Mark::Link { href } => Mark::Link { href },
        }
    }
}
