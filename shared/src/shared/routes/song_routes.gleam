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

pub fn search() -> route.Route(Nil, SearchQuery, Nil, List(song.Song)) {
  route.new()
  |> route.with_method(http.Get)
  |> route.with_path(path.static_path(["api", "songs", "search"]))
  |> route.with_query(
    query.complex_query(query.QueryConverter(search_encoder, search_decoder)),
  )
  |> route.with_response_body(body.json_body(
    json.array(_, song.song_encoder),
    dynamic.list(song.song_decoder),
  ))
}

pub fn search_encoder(query: SearchQuery) -> List(#(String, String)) {
  [#("q", query.search), #("token", query.token)]
}

pub fn search_decoder(
  value: List(#(String, String)),
) -> Result(SearchQuery, Nil) {
  use search <- result.try(list.key_find(value, "q"))
  use token <- result.try(list.key_find(value, "token"))

  Ok(SearchQuery(search:, token:))
}

pub type SearchQuery {
  SearchQuery(search: String, token: String)
}
