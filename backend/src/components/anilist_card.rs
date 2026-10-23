use serde_json::{json, Value};
pub fn view(data: &Value) -> Value {
    json!({"title":"Anime Archive","anime":{"total":data["anime"]["total"],"episodes":data["anime"]["episodes"],"formats":data["anime"]["formats"]},
      "manga":{"title":"Manga Archive","total":data["manga"]["total"],"chapters":data["manga"]["chapters"],"volumes":data["manga"]["volumes"],"formats":data["manga"]["formats"]}})
}
