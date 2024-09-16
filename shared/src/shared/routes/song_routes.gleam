import gleam/dynamic
import gleam/http
import gleam/json
import gleam/list
import gleam/result
import glitr/body
import glitr/path
import glitr/query
import glitr/route
import shared/types/song

pub fn search() -> route.Route(Nil, String, Nil, List(song.Song)) {
  route.new()
  |> route.with_method(http.Get)
  |> route.with_path(path.static_path(["songs", "search"]))
  |> route.with_query(
    query.complex_query(query.QueryConverter(search_encoder, search_decoder)),
  )
  |> route.with_response_body(body.json_body(
    json.array(_, song.song_encoder),
    dynamic.list(song.song_decoder),
  ))
}

pub fn search_encoder(value: String) -> List(#(String, String)) {
  [#("q", value)]
}

pub fn search_decoder(value: List(#(String, String))) -> Result(String, Nil) {
  use search <- result.try(list.key_find(value, "q"))

  Ok(search)
}
