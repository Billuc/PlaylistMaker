import gleam/dynamic
import gleam/json
import gleam/result
import glitr

pub type Song {
  Song(title: String, artists: List(String), album: String, source: SongSource)
}

pub type SongSource {
  Youtube(url: String)
  Spotify(url: String)
}

pub fn song_converter() {
  glitr.JsonConverter(song_encoder, song_decoder)
}

pub fn song_list_converter() {
  glitr.JsonConverter(
    fn(list) { list |> json.array(song_encoder) },
    //
    fn(values) { values |> dynamic.list(song_decoder) },
  )
}

pub fn song_encoder(song: Song) -> json.Json {
  json.object([
    #("title", json.string(song.title)),
    #("artists", song.artists |> json.array(json.string)),
    #("album", json.string(song.album)),
    #("source", song_source_encoder(song.source)),
  ])
}

pub fn song_decoder(
  v: dynamic.Dynamic,
) -> Result(Song, List(dynamic.DecodeError)) {
  v
  |> dynamic.decode4(
    Song,
    dynamic.field("title", dynamic.string),
    dynamic.field("artists", dynamic.list(dynamic.string)),
    dynamic.field("album", dynamic.string),
    dynamic.field("source", song_source_decoder),
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
