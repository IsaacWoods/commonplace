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
use std::path::Path;

#[launch]
pub fn rocket() -> _ {
    rocket::build()
        .manage(zettel::ZettelStore::new())
        .mount("/api", routes![zettel::create, zettel::fetch, zettel::query, zettel::update])
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
    async fn handle<'r>(&self, request: &'r Request<'_>, data: Data<'r>) -> Outcome<'r> {
        Outcome::from(request, NamedFile::open(&self.0).await.ok())
    }
}
