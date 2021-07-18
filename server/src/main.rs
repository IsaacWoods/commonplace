#![feature(type_ascription)]

mod zettel;

use rocket::{
    fs::{relative, FileServer, NamedFile},
    http::Method,
    launch,
    route::{Handler, Outcome, Route},
    routes,
    Data,
    Request,
};
use std::{path::Path, sync::Arc};
use zettel::Index;

#[launch]
pub fn rocket() -> _ {
    let index = Arc::new(Index::create());
    tokio::spawn(zettel::index::commit_index(index.clone()));

    rocket::build()
        .manage(zettel::ZettelStore::new(index))
        .mount("/api", routes![zettel::create, zettel::fetch, zettel::list, zettel::search, zettel::update])
        .mount("/static", FileServer::from(relative!("../app/dist")))
        .mount("/", AppPage(Path::new(relative!("../app/dist/index.html"))))
}

/// The app is routed on the client using `react-router-dom`, and so we need to serve `index.html` regardless of
/// the actual path we're at. We do this at a high rank so that other routes are attempted first.
#[derive(Clone)]
struct AppPage(&'static Path);

impl Into<Vec<Route>> for AppPage {
    fn into(self) -> Vec<Route> {
        const RANK: isize = 20;
        let mut route = Route::ranked(RANK, Method::Get, "/<path..>", self);
        route.name = Some("AppPage".into());
        vec![route]
    }
}

#[rocket::async_trait]
impl Handler for AppPage {
    async fn handle<'r>(&self, request: &'r Request<'_>, _data: Data<'r>) -> Outcome<'r> {
        Outcome::from(request, NamedFile::open(&self.0).await.ok())
    }
}
