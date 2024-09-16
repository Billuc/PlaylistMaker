import gleam/dynamic
import gleam/http/request
import gleam/httpc
import gleam/json
import gleam/result
import glitr
import glitr_wisp/errors
import server/web
import shared/types/song

pub fn search(
  _ctx: web.Context,
  opts: glitr.RouteOptions(Nil, String, Nil),
) -> Result(List(song.Song), errors.AppError) {
  use base_req <- result.try(
    request.to("https://api.spotify.com/v1/search")
    |> result.replace_error(errors.DecoderError(
      "Error while creating the request",
    )),
  )

  let req =
    base_req
    |> request.prepend_header("Authorization", "Bearer XXX")
    |> request.set_query([#("q", opts.query), #("type", "track")])

  use resp <- result.try(
    httpc.send(req)
    |> result.replace_error(errors.DecoderError(
      "Error while sending the request",
    )),
  )

  resp.body
  |> json.decode(spotify_search_decode)
  |> result.replace_error(errors.DecoderError(
    "Error while decoding the results",
  ))
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
  |> dynamic.decode4(
    song.Song,
    dynamic.field("name", dynamic.string),
    dynamic.field(
      "artists",
      dynamic.list(dynamic.field("name", dynamic.string)),
    ),
    dynamic.field("album", dynamic.field("name", dynamic.string)),
    dynamic.field("href", dynamic.decode1(song.Spotify, dynamic.string)),
  )
}
