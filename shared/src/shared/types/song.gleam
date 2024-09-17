import gleam/dynamic
import gleam/json
import gleam/option
import gleam/result

pub type Song {
  Song(
    id: String,
    title: String,
    artists: List(String),
    album: String,
    album_cover: String,
    source: SongSource,
    preview_url: option.Option(String),
  )
}

pub type SongSource {
  Youtube(url: String)
  Spotify(url: String)
}

pub fn song_encoder(song: Song) -> json.Json {
  json.object([
    #("id", json.string(song.id)),
    #("title", json.string(song.title)),
    #("artists", song.artists |> json.array(json.string)),
    #("album", json.string(song.album)),
    #("album_cover", json.string(song.album_cover)),
    #("source", song_source_encoder(song.source)),
    #("preview_url", json.nullable(song.preview_url, json.string)),
  ])
}

pub fn song_decoder(
  v: dynamic.Dynamic,
) -> Result(Song, List(dynamic.DecodeError)) {
  v
  |> dynamic.decode7(
    Song,
    dynamic.field("id", dynamic.string),
    dynamic.field("title", dynamic.string),
    dynamic.field("artists", dynamic.list(dynamic.string)),
    dynamic.field("album", dynamic.string),
    dynamic.field("album_cover", dynamic.string),
    dynamic.field("source", song_source_decoder),
    dynamic.field("preview_url", dynamic.optional(dynamic.string)),
  )
}

pub fn song_source_encoder(song_source: SongSource) -> json.Json {
  case song_source {
    Youtube(url) ->
      json.object([
        #("source", json.string("youtube")),
        #("url", json.string(url)),
      ])
    Spotify(url) ->
      json.object([
        #("source", json.string("spotify")),
        #("url", json.string(url)),
      ])
  }
}

pub fn song_source_decoder(
  v: dynamic.Dynamic,
) -> Result(SongSource, List(dynamic.DecodeError)) {
  let source = v |> dynamic.field("source", dynamic.string)

  case source {
    Ok("youtube") -> {
      v |> dynamic.field("url", dynamic.string) |> result.map(Youtube)
    }
    Ok("spotify") -> {
      v |> dynamic.field("url", dynamic.string) |> result.map(Spotify)
    }
    Ok(s) -> Error([dynamic.DecodeError("Wrong source name", s, ["source"])])
    Error(err) -> Error(err)
  }
}
