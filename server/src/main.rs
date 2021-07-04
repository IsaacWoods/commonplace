#![feature(type_ascription)]

mod zettel;

use rocket::{fs::FileServer, get, launch, routes};

#[launch]
pub fn rocket() -> _ {
    rocket::build()
        .manage(zettel::ZettelStore::new())
        .mount("/", FileServer::from(rocket::fs::relative!("../app/dist")))
}
