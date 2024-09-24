import gleam/dynamic
import gleam/io
import gleam/json
import shared/types/song

pub type Playlist {
  Playlist(id: String, name: String, songs: List(song.Song))
}

pub fn playlist_encoder(playlist: Playlist) -> json.Json {
  json.object([
    #("id", json.string(playlist.id)),
    #("name", json.string(playlist.name)),
    #("songs", json.array(playlist.songs, song.song_encoder)),
  ])
}

pub fn playlist_decoder(
  value: dynamic.Dynamic,
) -> Result(Playlist, List(dynamic.DecodeError)) {
  value
  |> dynamic.decode3(
    Playlist,
    dynamic.field("id", dynamic.string),
    dynamic.field("name", dynamic.string),
    dynamic.field("songs", dynamic.list(song.song_decoder)),
  )
}

pub fn db_decoder(
  value: dynamic.Dynamic,
) -> Result(Playlist, List(dynamic.DecodeError)) {
  value
  |> dynamic.decode3(
    Playlist,
    dynamic.element(0, dynamic.string),
    dynamic.element(1, dynamic.string),
    fn(_) { Ok([]) },
  )
}

pub type UpsertPlaylist {
  UpsertPlaylist(name: String)
}

pub fn upsert_playlist_encoder(upsert: UpsertPlaylist) -> json.Json {
  json.object([#("name", json.string(upsert.name))])
}

pub fn upsert_playlist_decoder(
  value: dynamic.Dynamic,
) -> Result(UpsertPlaylist, List(dynamic.DecodeError)) {
  value
  |> dynamic.decode1(UpsertPlaylist, dynamic.field("name", dynamic.string))
}
