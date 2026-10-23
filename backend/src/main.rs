use axum::{routing::get, Json, Router};
use serde_json::{json, Value};
use std::{env, net::SocketAddr, time::Duration};

async fn health() -> Json<Value> {
    Json(json!({"status":"ok","service":"vireon-noctis-api"}))
}
async fn site() -> Json<Value> {
    Json(json!({
        "name":"Vireon Noctis",
        "version": env!("CARGO_PKG_VERSION"),
        "integrations": ["GitHub", "AniList", "Last.fm", "Lunar X"],
        "profile": "https://lunarx.to/profile/vvvx"
    }))
}
async fn archive() -> Json<Value> {
    let client = match reqwest::Client::builder()
        .timeout(Duration::from_secs(8))
        .user_agent("VireonNoctisSite/1.0")
        .build()
    {
        Ok(client) => client,
        Err(_) => return Json(json!({"status":"partial","sources":{}})),
    };

    let github = match client.get("https://api.github.com/users/VireonNoctis").send().await {
        Ok(response) if response.status().is_success() => response.json::<Value>().await.ok(),
        _ => None,
    };
    let anilist_body = json!({
        "query": "query { User(name: \\"Vireon\\") { name avatar { large } siteUrl statistics { anime { count episodesWatched minutesWatched meanScore } manga { count chaptersRead volumesRead meanScore } } } }"
    });
    let anilist = match client.post("https://graphql.anilist.co").json(&anilist_body).send().await {
        Ok(response) if response.status().is_success() => response.json::<Value>().await.ok(),
        _ => None,
    };
    let lunar = match client.get("https://api.lunarx.to/api/animes/profile?username=vvvx").send().await {
        Ok(response) if response.status().is_success() => response.json::<Value>().await.ok(),
        _ => None,
    };
    Json(json!({
        "status": "partial",
        "sources": {
            "github": github,
            "anilist": anilist,
            "lunar_x": lunar,
            "lastfm": {
                "configured": env::var("LASTFM_API_KEY").is_ok(),
                "note": "Last.fm requires LASTFM_API_KEY"
            }
        }
    }))
}
#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/site", get(site))
        .route("/api/v1/archive", get(archive));
    let port = env::var("PORT").ok().and_then(|p| p.parse::<u16>().ok()).unwrap_or(8080);
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let address: SocketAddr = format!("{host}:{port}").parse().expect("HOST and PORT must form a valid socket address");
    let listener = tokio::net::TcpListener::bind(address).await.expect("failed to bind API listener");
    axum::serve(listener, app).await.expect("API server failed");
}
