import gleam/dynamic
import gleam/http/request
import gleam/httpc
import gleam/json
import gleam/list
import gleam/result
import glitr
import glitr/wisp/errors
import pprint
import server/web
import shared/routes/song_routes
import shared/types/song

pub fn search(
  _ctx: web.Context,
  opts: glitr.RouteOptions(Nil, song_routes.SearchQuery, Nil),
) -> Result(List(song.Song), errors.AppError) {
  use base_req <- result.try(
    request.to("https://api.spotify.com/v1/search")
    |> result.replace_error(errors.DecoderError(
      "Error while creating the request",
    )),
  )

  let req =
    base_req
    |> request.prepend_header("Authorization", "Bearer " <> opts.query.token)
    |> request.set_query([#("q", opts.query.search), #("type", "track")])

  use resp <- result.try(
    httpc.send(req)
    |> result.replace_error(errors.InternalError(
      "Error while sending the request",
    )),
  )

  resp.body
  |> json.decode(spotify_search_decode)
  |> result.map_error(fn(_) {
    // pprint.debug(resp.body)
    errors.InternalError("Error while decoding the results")
  })
}

pub fn spotify_search_decode(
  value: dynamic.Dynamic,
) -> Result(List(song.Song), List(dynamic.DecodeError)) {
  value
  |> dynamic.field(
    "tracks",
    dynamic.field("items", dynamic.list(spotify_decode_item)),
  )
}

pub fn spotify_decode_item(
  value: dynamic.Dynamic,
) -> Result(song.Song, List(dynamic.DecodeError)) {
  value
  |> dynamic.decode7(
    song.Song,
    dynamic.field("id", dynamic.string),
    dynamic.field("name", dynamic.string),
    dynamic.field(
      "artists",
      dynamic.list(dynamic.field("name", dynamic.string)),
    ),
    dynamic.field("album", dynamic.field("name", dynamic.string)),
    dynamic.field(
      "album",
      dynamic.field("images", fn(v) {
        v
        |> dynamic.list(dynamic.field("url", dynamic.string))
        |> result.try(fn(imgs) {
          imgs
          |> list.last
          |> result.replace_error([
            dynamic.DecodeError("Object", "Nil", ["album", "images", "0"]),
          ])
        })
      }),
    ),
    dynamic.field("href", dynamic.decode1(song.Spotify, dynamic.string)),
    dynamic.field("preview_url", dynamic.optional(dynamic.string)),
  )
  |> pprint.debug
}
