use serde_json::{json, Value};
pub fn view(github: Option<&Value>, anilist: Option<&Value>, lastfm: Option<&Value>) -> Value {
    json!({"github":{"repositories":github.and_then(|v|v.get("repositories")),"followers":github.and_then(|v|v.get("followers")),"following":github.and_then(|v|v.get("following"))},
      "anime":{"total":anilist.and_then(|v|v.pointer("/anime/total")),"episodes":anilist.and_then(|v|v.pointer("/anime/episodes"))},
      "manga":{"total":anilist.and_then(|v|v.pointer("/manga/total")),"chapters":anilist.and_then(|v|v.pointer("/manga/chapters")),"volumes":anilist.and_then(|v|v.pointer("/manga/volumes"))},
      "lastfm":{"scrobbles":lastfm.and_then(|v|v.get("scrobbles"))}})
}
