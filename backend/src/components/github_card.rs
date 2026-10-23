use serde_json::{json, Value};
pub fn view(data: &Value) -> Value {
    json!({"repositories":data["repositories"],"followers":data["followers"],"following":data["following"],"profile":data["profile"]})
}
