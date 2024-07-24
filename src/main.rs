mod index;
mod store;
mod zettel;

use axum::{
    http::StatusCode,
    routing::{get, post},
    Router,
};
use index::Index;
use std::sync::Arc;
use store::ZettelStore;
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

struct AppState {
    store: ZettelStore,
    index: Arc<Index>,
}

#[tokio::main]
pub async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "commonplace=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let index = Index::new();
    tokio::spawn(index::commit_index(index.clone()));

    let state = Arc::new(AppState { store: ZettelStore::new(), index });

    let api_routes = Router::new()
        .route("/zettel.create", post(zettel::create))
        .route("/zettel.fetch/:id", get(zettel::fetch))
        .route("/zettel.list", get(zettel::list))
        .route("/zettel.search", get(zettel::search))
        .route("/zettel.update/:id", post(zettel::update))
        .fallback(api_fallback);

    /*
     * The main router for the app. We serve static files and route API calls, then fallback to the
     * index page to allow client-side routing to work properly.
     */
    let dist_dir = option_env!("COMMONPLACE_DIST_DIR").unwrap_or("app/dist/");
    let app = Router::new()
        .nest_service("/static", ServeDir::new(dist_dir))
        .nest("/api", api_routes)
        .fallback_service(ServeFile::new(format!("{}/index.html", dist_dir)))
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    tracing::info!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn api_fallback() -> (StatusCode, &'static str) {
    (StatusCode::NOT_FOUND, "API method not found")
}
