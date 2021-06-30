/*
 * Copyright (C) 2021, Isaac Woods.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

use rocket::{fs::FileServer, get, launch, routes};

#[launch]
pub fn rocket() -> _ {
    rocket::build().mount("/", FileServer::from(rocket::fs::relative!("../app/dist")))
}
