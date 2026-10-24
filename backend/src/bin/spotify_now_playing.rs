use serde_json::{json, Value};
use std::{env, fs, process};

fn required_env(name: &str) -> String {
    match env::var(name) {
        Ok(value) if !value.trim().is_empty() => value,
        _ => {
            eprintln!("Missing required environment variable: {name}");
            process::exit(1);
        }
    }
}

#[tokio::main]
async fn main() {
    let client_id = required_env("SPOTIFY_CLIENT_ID");
    let client_secret = required_env("SPOTIFY_CLIENT_SECRET");
    let refresh_token = required_env("SPOTIFY_REFRESH_TOKEN");
    let client = reqwest::Client::builder()
        .user_agent("VireonNoctisSite/1.0")
        .build()
        .expect("HTTP client should initialize");

    let token_response = match client
        .post("https://accounts.spotify.com/api/token")
        .basic_auth(&client_id, Some(&client_secret))
        .form(&[("grant_type", "refresh_token"), ("refresh_token", refresh_token.as_str())])
        .send()
        .await
    {
        Ok(response) => response,
        Err(_) => {
            eprintln!("Could not reach Spotify to refresh the access token.");
            process::exit(1);
        }
    };
    if !token_response.status().is_success() {
        eprintln!("Spotify token refresh failed (HTTP {}). Check the app credentials and refresh token secrets.", token_response.status());
        process::exit(1);
    }
    let token_data: Value = token_response.json().await.unwrap_or(Value::Null);
    let access_token = match token_data["access_token"].as_str() {
        Some(token) if !token.is_empty() => token.to_owned(),
        _ => {
            eprintln!("Spotify did not return an access token.");
            process::exit(1);
        }
    };

    let playback_response = match client
        .get("https://api.spotify.com/v1/me/player/currently-playing")
        .bearer_auth(access_token)
        .send()
        .await
    {
        Ok(response) => response,
        Err(_) => {
            eprintln!("Could not reach Spotify to retrieve playback state.");
            process::exit(1);
        }
    };

    let next = if playback_response.status() == reqwest::StatusCode::NO_CONTENT {
        json!({
            "configured": true, "isPlaying": false, "track": null, "artist": null,
            "album": null, "albumImage": null, "url": null
        })
    } else {
        if !playback_response.status().is_success() {
            eprintln!("Spotify playback request failed (HTTP {}). Check API access and the granted scope.", playback_response.status());
            process::exit(1);
        }
        let playback: Value = match playback_response.json().await {
            Ok(value) => value,
            Err(_) => {
                eprintln!("Spotify returned an unreadable playback response.");
                process::exit(1);
            }
        };
        let item = if playback["currently_playing_type"].as_str() == Some("track")
            && playback["item"]["type"].as_str() == Some("track") {
            &playback["item"]
        } else {
            &Value::Null
        };
        let artist = item["artists"].as_array().map(|artists| {
            artists.iter()
                .filter_map(|artist| artist["name"].as_str())
                .collect::<Vec<_>>()
                .join(", ")
        }).filter(|value| !value.is_empty());
        let is_track = !item.is_null();
        json!({
            "configured": true,
            "isPlaying": playback["is_playing"].as_bool().unwrap_or(false) && is_track,
            "track": item["name"].as_str(),
            "artist": artist,
            "album": item["album"]["name"].as_str(),
            "albumImage": item["album"]["images"].as_array().and_then(|images| images.first()).and_then(|image| image["url"].as_str()),
            "url": item["external_urls"]["spotify"].as_str()
        })
    };

    let path = "public/spotify-now-playing.json";
    let content = format!("{}\n", serde_json::to_string_pretty(&next).expect("playback state should serialize"));
    let previous = fs::read_to_string(path).unwrap_or_default();
    if previous.trim() == content.trim() {
        println!("Spotify playback state is unchanged; no deploy is needed.");
    } else {
        if let Err(error) = fs::write(path, content) {
            eprintln!("Could not write {path}: {error}");
            process::exit(1);
        }
        println!("Spotify playback state changed; publishing a new static snapshot.");
    }
}