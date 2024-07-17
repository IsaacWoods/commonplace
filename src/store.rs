use crate::zettel::{ZettelContent, ZettelUpdate};
use commonplace::ZettelId;
use serde::{Deserialize, Serialize};
use std::{convert::TryInto, ops::Deref};

pub struct ZettelStore {
    tree: sled::Tree,
}

impl ZettelStore {
    pub fn new() -> ZettelStore {
        ZettelStore { tree: sled::open("db").unwrap().open_tree("zettels_v2").unwrap() }
    }

    /// Try to create a new Zettel with a generated ID. Returns `None` if a duplicate ID is generated - this means
    /// client(s) are trying to create Zettels too fast (more than one a second).
    pub fn create(&self) -> Option<ZettelId> {
        let id = ZettelId::generate();

        /*
         * We're using the compare-and-swap to detect duplicate ID generation - if there's already an entry for
         * that ID, turn the error into `None`.
         */
        self.tree
            .compare_and_swap(&id.encode(), None::<&[u8]>, Some(ZettelRecord::new().serialize()))
            .unwrap()
            .ok()?;
        Some(id)
    }

    pub fn get(&self, id: ZettelId) -> Option<ZettelRecord> {
        self.tree.get(id.encode()).unwrap().map(|bytes| ZettelRecord::deserialize(&bytes).unwrap())
    }

    pub fn all(&self) -> Vec<(ZettelId, ZettelRecord)> {
        self.tree
            .iter()
            .filter_map(|entry| {
                if let Ok((key, value)) = entry {
                    let id = ZettelId::decode(key.deref().try_into().unwrap());
                    let zettel = ZettelRecord::deserialize(&value).unwrap();
                    Some((id, zettel))
                } else {
                    println!("Weird entry when iterating Zettels: {:?}", entry);
                    None
                }
            })
            .collect()
    }

    pub fn update(&self, id: ZettelId, update: ZettelUpdate) {
        self.tree
            .update_and_fetch(&id.encode(), |old| {
                let mut zettel = ZettelRecord::deserialize(old.unwrap()).unwrap();

                zettel.title = update.title.clone();
                zettel.content = update.content.clone();

                // TODO: update the index when it exists again
                // self.index.update_zettel(id, &zettel);

                Some(zettel.serialize())
            })
            .unwrap();
    }
}

// TODO: if we just segregate Zettle versions into separate db trees, is this still needed?
/// The first two bytes of a Zettel's value when persisted into the database will contain a version. This is to
/// allow us to change the format of Zettels and to migrate old Zettels to the new format. This version should be
/// incremented when:
///    - The format of the actual Zettel data is changed
///    - The format into which that data is serialized changes (either through a change of format, or a change in
///      version of that format (e.g. `bincode`'s encoding is not necessarily stable between non-minor versions, or
///      if the configuration changes)).
pub const CURRENT_ZETTEL_FORMAT_VERSION: u16 = 2;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ZettelRecord {
    pub title: String,
    pub content: ZettelContent,
    pub backlinks: Vec<ZettelId>,
}

#[derive(Clone, Debug)]
pub enum DeserializeError {
    WrongVersion,
}

impl ZettelRecord {
    pub fn new() -> ZettelRecord {
        ZettelRecord { title: String::new(), content: ZettelContent::empty(), backlinks: Vec::new() }
    }

    pub fn serialize(&self) -> Vec<u8> {
        let mut bytes = Vec::from(u16::to_le_bytes(CURRENT_ZETTEL_FORMAT_VERSION));
        bytes.extend(&serde_cbor::to_vec(self).unwrap());
        bytes
    }

    pub fn deserialize(bytes: &[u8]) -> Result<ZettelRecord, DeserializeError> {
        let format_version = u16::from_le_bytes(bytes[0..2].try_into().unwrap());
        if format_version != CURRENT_ZETTEL_FORMAT_VERSION {
            return Err(DeserializeError::WrongVersion);
        }

        Ok(serde_cbor::from_slice(&bytes[2..]).unwrap())
    }
}
