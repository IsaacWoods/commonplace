use super::index::Index;
use bincode::Options;
use commonplace::{
    record::{Block, ZettelRecord, CURRENT_ZETTEL_FORMAT_VERSION},
    ZettelId,
};
use std::{convert::TryInto, ops::Deref, sync::Arc};

pub struct ZettelStore {
    tree: sled::Tree,
    index: Arc<Index>,
    /// It's important we use the `serialize` and `deserialize` functions on `DefaultOptions`, instead of the free
    /// functions in `bincode`, as the options differ. Specifically, this version will use the varint encoding for
    /// lengths, which will save a lot of space in our usecase, as we have many vectors with very short lengths.
    bincode: bincode::DefaultOptions,
}

impl ZettelStore {
    pub fn new(index: Arc<Index>) -> ZettelStore {
        ZettelStore {
            tree: sled::open("db").unwrap().open_tree("zettels").unwrap(),
            index,
            bincode: bincode::DefaultOptions::new(),
        }
    }

    pub fn create(&self) -> ZettelId {
        // TODO: detect duplicate IDs being generated properly
        let id = ZettelId::generate();
        let mut value = Vec::from(u16::to_le_bytes(CURRENT_ZETTEL_FORMAT_VERSION));
        value.extend(self.bincode.serialize(&ZettelRecord::default()).unwrap());

        self.tree
            .compare_and_swap(&id.encode(), None: Option<&[u8]>, Some(value))
            .unwrap()
            .expect("Failed to create Zettel!");
        id
    }

    pub fn get(&self, id: ZettelId) -> Option<ZettelRecord> {
        self.tree.get(id.encode()).unwrap().map(|bytes| {
            let format_version = u16::from_le_bytes(bytes[0..2].try_into().unwrap());
            assert_eq!(format_version, CURRENT_ZETTEL_FORMAT_VERSION);
            self.bincode.deserialize::<ZettelRecord>(&bytes[2..]).unwrap()
        })
    }

    pub fn all(&self) -> Vec<(ZettelId, ZettelRecord)> {
        self.tree
            .iter()
            .filter_map(|entry| {
                if let Ok((key, value)) = entry {
                    let id = ZettelId::decode(key.deref().try_into().unwrap());

                    let format_version = u16::from_le_bytes(value[0..2].try_into().unwrap());
                    assert_eq!(format_version, CURRENT_ZETTEL_FORMAT_VERSION);
                    let zettel: ZettelRecord = self.bincode.deserialize(&value[2..]).unwrap();
                    Some((id, zettel))
                } else {
                    println!("Weird entry when iterating Zettels: {:?}", entry);
                    None
                }
            })
            .collect()
    }

    pub fn search(&self, query: &str) -> Vec<ZettelId> {
        self.index.search(query)
    }

    pub fn update(&self, id: ZettelId, new_title: Option<String>, new_content: Option<Vec<Block>>) {
        self.tree
            .update_and_fetch(&id.encode(), |old| {
                let old = old.unwrap();
                let format_version = u16::from_le_bytes(old[0..2].try_into().unwrap());
                assert_eq!(format_version, CURRENT_ZETTEL_FORMAT_VERSION);
                let mut zettel: ZettelRecord = self.bincode.deserialize(&old[2..]).unwrap();

                if let Some(ref title) = &new_title {
                    zettel.title = title.clone();
                }

                if let Some(ref content) = &new_content {
                    zettel.content = content.clone();
                }

                self.index.update_zettel(id, &zettel);

                let mut value = Vec::from(u16::to_le_bytes(CURRENT_ZETTEL_FORMAT_VERSION));
                value.extend(self.bincode.serialize(&zettel).unwrap());
                Some(value)
            })
            .unwrap();
    }
}
