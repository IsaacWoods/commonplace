use rocket::{fs::FileServer, get, launch, routes};

#[launch]
pub fn rocket() -> _ {
    rocket::build().mount("/", FileServer::from(rocket::fs::relative!("../app/dist")))
}
