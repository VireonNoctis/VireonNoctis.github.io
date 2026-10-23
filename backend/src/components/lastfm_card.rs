use serde_json::{json, Value};
pub fn view(stats: &Value, recent: Option<&Value>) -> Value {
    json!({"scrobbles":stats["scrobbles"],"username":stats["username"],"now_playing":recent})
}
