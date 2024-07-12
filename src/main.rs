mod index;
mod store;
mod zettel;

use axum::{
    extract::State,
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use store::ZettelStore;
use tokio::sync::Mutex;
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

struct AppState {
    store: ZettelStore,
}

#[tokio::main]
pub async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env()
                // .unwrap_or_else(|_| "commonplace=debug,tower_http=debug".into()),
                .unwrap_or_else(|_| "commonplace=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = Arc::new(AppState { store: ZettelStore::new() });

    let api_routes = Router::new()
        .route("/zettel.create/", post(zettel::create))
        .route("/zettel.fetch/:id", get(zettel::fetch))
        .route("/zettel.list/", get(zettel::list))
        .route("/zettel.search?query", get(zettel::search))
        .route("/zettel.update/:id", post(zettel::update));

    /*
     * The main router for the app. We serve static files and route API calls, then fallback to the
     * index page to allow client-side routing to work properly.
     */
    // TODO: allow custom specification of the dist directory for Docker etc.
    let app = Router::new()
        .nest_service("/static", ServeDir::new("app/dist"))
        .nest("/api", api_routes)
        .fallback_service(ServeFile::new("app/dist/index.html"))
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    tracing::info!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
