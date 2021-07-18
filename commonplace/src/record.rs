use crate::{endpoint, ZettelId};
use bincode::Options;
use serde::{Deserialize, Serialize};
use std::convert::TryInto;

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
    // TODO: it kinda sucks that we need a whole string
    pub emoji: Option<String>,
    pub content: Vec<Block>,
    pub mentions: Vec<ZettelId>,
}

#[derive(Clone, Debug)]
pub enum DeserializeError {
    WrongVersion,
}

impl ZettelRecord {
    pub fn serialize(&self) -> Vec<u8> {
        let mut bytes = Vec::from(u16::to_le_bytes(CURRENT_ZETTEL_FORMAT_VERSION));
        bytes.extend(bincode::DefaultOptions::new().serialize(self).unwrap());
        bytes
    }

    pub fn deserialize(bytes: &[u8]) -> Result<ZettelRecord, DeserializeError> {
        let format_version = u16::from_le_bytes(bytes[0..2].try_into().unwrap());
        if format_version != CURRENT_ZETTEL_FORMAT_VERSION {
            return Err(DeserializeError::WrongVersion);
        }
        Ok(bincode::DefaultOptions::new().deserialize(&bytes[2..]).unwrap())
    }
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
    Link { text: String, href: String, marks: Vec<Mark> },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Mark {
    Bold,
    Italic,
    Strikethrough,
    Highlight,
}

impl From<endpoint::Zettel> for ZettelRecord {
    fn from(zettel: endpoint::Zettel) -> ZettelRecord {
        ZettelRecord {
            title: zettel.title,
            emoji: None,
            content: zettel.content.into_iter().map(Block::from).collect(),
            mentions: vec![],
        }
    }
}

impl From<endpoint::Block> for Block {
    fn from(block: endpoint::Block) -> Block {
        match block {
            endpoint::Block::Paragraph { inlines } => {
                Block::Paragraph { inlines: inlines.into_iter().map(Inline::from).collect() }
            }
            endpoint::Block::Heading { level, inlines } => {
                Block::Heading { level, inlines: inlines.into_iter().map(Inline::from).collect() }
            }
            endpoint::Block::Image { src } => Block::Image { src },
            endpoint::Block::Divider => Block::Divider,
            endpoint::Block::List { items } => {
                Block::List { items: items.into_iter().map(ListItem::from).collect() }
            }
        }
    }
}

impl From<endpoint::ListItem> for ListItem {
    fn from(item: endpoint::ListItem) -> ListItem {
        ListItem { blocks: item.blocks.into_iter().map(Block::from).collect() }
    }
}

impl From<endpoint::Inline> for Inline {
    fn from(inline: endpoint::Inline) -> Inline {
        match inline {
            endpoint::Inline::Text { text, marks } => {
                Inline::Text { text, marks: marks.into_iter().map(Mark::from).collect() }
            }
            endpoint::Inline::Link { text, href, marks } => {
                Inline::Link { text, href, marks: marks.into_iter().map(Mark::from).collect() }
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
        }
    }
}
