use crate::{api::ApiClient, scrapers::sources};
use serde_json::{json, Value};

pub async fn profile(api: &ApiClient, username: &str) -> Option<Value> {
    let query = r#"query($name:String){User(name:$name){id name about avatar{large} bannerImage statistics{anime{count episodesWatched minutesWatched meanScore formatStats{format count}} manga{count chaptersRead volumesRead meanScore formatStats{format count}}} favourites{anime{nodes{title{romaji}}} manga{nodes{title{romaji}}}}}}"#;
    let response = api.post_json(sources::ANILIST_GRAPHQL, &json!({"query":query,"variables":{"name":username}})).await?;
    response.pointer("/data/User").cloned()
}
