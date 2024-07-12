use chrono::{Datelike, Timelike, Utc};
use serde::{Deserialize, Serialize};

/// Each Zettel is associated with a unique ID, which is based on a timestamp of when the Zettel was created,
/// turned into a single number, but retaining most of its human-readability. For example, a Zettel created when
/// this comment was written would have the form (with dashes inserted for readability) `12021-07-04-23-32-24`. This
/// allows a Zettel to be created every second, which I think will be okay for real-world purposes.
///
/// The time in the timestamp is UTC+0, and the date uses the Holocene calendar.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
#[repr(transparent)]
pub struct ZettelId(pub u64);

impl ZettelId {
    pub fn generate() -> ZettelId {
        let datetime = Utc::now();
        let year = datetime.year() as u64 + 10000;
        let month = datetime.month() as u64;
        let day = datetime.day() as u64;
        let hour = datetime.hour() as u64;
        let minute = datetime.minute() as u64;
        let second = datetime.second() as u64;

        ZettelId(
            (year * 1_00_00_00_00_00)
                + (month * 1_00_00_00_00)
                + (day * 1_00_00_00)
                + (hour * 1_00_00)
                + (minute * 1_00)
                + second,
        )
    }

    pub fn encode(&self) -> [u8; 8] {
        /*
         * NOTE: when we encode Zettel IDs to be used as keys in the `sled` database, we do so in big-endian. This
         * is because `sled` sorts byte-by-byte, so this correctly lexicographically sorts Zettels by ID.
         */
        self.0.to_be_bytes()
    }

    pub fn decode(bytes: [u8; 8]) -> ZettelId {
        ZettelId(u64::from_be_bytes(bytes))
    }
}
