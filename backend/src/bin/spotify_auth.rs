use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Html,
    routing::get,
    Router,
};
use rand::{rngs::OsRng, RngCore};
use serde_json::Value;
use std::{collections::HashMap, env, sync::Arc};
use tokio::sync::{oneshot, Mutex};
use url::Url;

const REDIRECT_URI: &str = "http://127.0.0.1:8888/callback";

#[derive(Clone)]
struct AppState {
    client_id: String,
    client_secret: String,
    state: String,
    shutdown: Arc<Mutex<Option<oneshot::Sender<()>>>>,
}

async fn callback(
    State(state): State<AppState>,
    Query(params): Query<HashMap<String, String>>,
) -> (StatusCode, Html<&'static str>) {
    let status_and_page = if params.get("state").map(String::as_str) != Some(state.state.as_str()) {
        eprintln!("Spotify callback rejected because the authorization state did not match.");
        (StatusCode::BAD_REQUEST, Html("Authorization state did not match. You can close this tab and retry."))
    } else if params.contains_key("error") || !params.contains_key("code") {
        eprintln!("Spotify authorization was declined or failed.");
        (StatusCode::BAD_REQUEST, Html("Spotify authorization was not completed. You can close this tab and retry."))
    } else {
        let client = reqwest::Client::new();
        let response = client
            .post("https://accounts.spotify.com/api/token")
            .basic_auth(&state.client_id, Some(&state.client_secret))
            .form(&[
                ("grant_type", "authorization_code"),
                ("code", params.get("code").map(String::as_str).unwrap_or_default()),
                ("redirect_uri", REDIRECT_URI),
            ])
            .send()
            .await;

        match response {
            Ok(response) if response.status().is_success() => {
                match response.json::<Value>().await {
                    Ok(data) if data["refresh_token"].as_str().is_some() => {
                        println!("\nSpotify authorization succeeded.");
                        println!("Copy this value into the GitHub Actions secret SPOTIFY_REFRESH_TOKEN:\n");
                        println!("{}\n", data["refresh_token"].as_str().unwrap_or_default());
                        println!("Do not paste this token into source files, issues, or public chat.");
                        (StatusCode::OK, Html("Spotify authorization completed. Return to your terminal to finish setup."))
                    }
                    _ => {
                        eprintln!("Spotify did not return a refresh token. Check the app credentials and exact redirect URI.");
                        (StatusCode::BAD_GATEWAY, Html("Token exchange failed. Check the terminal for a safe error message."))
                    }
                }
            }
            Ok(response) => {
                eprintln!("Spotify token exchange failed (HTTP {}). Check the app credentials and exact redirect URI.", response.status());
                (StatusCode::BAD_GATEWAY, Html("Token exchange failed. Check the terminal for a safe error message."))
            }
            Err(_) => {
                eprintln!("Could not reach Spotify to exchange the authorization code.");
                (StatusCode::BAD_GATEWAY, Html("Token exchange failed. Check the terminal for a safe error message."))
            }
        }
    };

    if let Some(tx) = state.shutdown.lock().await.take() {
        let _ = tx.send(());
    }
    status_and_page
}

#[tokio::main]
async fn main() {
    let client_id = env::var("SPOTIFY_CLIENT_ID").unwrap_or_default();
    let client_secret = env::var("SPOTIFY_CLIENT_SECRET").unwrap_or_default();
    if client_id.is_empty() || client_secret.is_empty() {
        eprintln!("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your local shell first.");
        std::process::exit(1);
    }

    let mut random_state = [0_u8; 24];
    OsRng.fill_bytes(&mut random_state);
    let state_token = random_state.iter().map(|byte| format!("{byte:02x}")).collect::<String>();
    let mut auth_url = Url::parse("https://accounts.spotify.com/authorize").expect("valid Spotify authorization URL");
    auth_url.query_pairs_mut()
        .append_pair("client_id", &client_id)
        .append_pair("response_type", "code")
        .append_pair("redirect_uri", REDIRECT_URI)
        .append_pair("scope", "user-read-currently-playing")
        .append_pair("state", &state_token);

    let listener = match tokio::net::TcpListener::bind("127.0.0.1:8888").await {
        Ok(listener) => listener,
        Err(_) => {
            eprintln!("Could not start the local callback server. Make sure port 8888 is available.");
            std::process::exit(1);
        }
    };
    let (shutdown_tx, shutdown_rx) = oneshot::channel();
    let app_state = AppState {
        client_id,
        client_secret,
        state: state_token,
        shutdown: Arc::new(Mutex::new(Some(shutdown_tx))),
    };
    let app = Router::new().route("/callback", get(callback)).with_state(app_state);

    println!("Open the following URL in your browser to authorize Spotify:\n");
    println!("{auth_url}\n");
    println!("Waiting for Spotify's callback on 127.0.0.1:8888 ...");

    if let Err(error) = axum::serve(listener, app)
        .with_graceful_shutdown(async { let _ = shutdown_rx.await; })
        .await
    {
        eprintln!("Local callback server stopped: {error}");
        std::process::exit(1);
    }
}