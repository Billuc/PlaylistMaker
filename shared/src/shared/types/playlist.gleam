import gleam/dynamic
import glitr/convert
import shared/types/song

pub type Playlist {
  Playlist(id: String, name: String, songs: List(song.Song))
}

pub fn playlist_converter() -> convert.Converter(Playlist) {
  convert.object({
    use id <- convert.parameter
    use name <- convert.parameter
    use songs <- convert.parameter
    use <- convert.constructor
    Playlist(id:, name:, songs:)
  })
  |> convert.field("id", fn(v) { Ok(v.id) }, convert.string())
  |> convert.field("name", fn(v) { Ok(v.name) }, convert.string())
  |> convert.field(
    "songs",
    fn(v) { Ok(v.songs) },
    convert.list(song.song_converter()),
  )
  |> convert.to_converter
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

pub fn upsert_playlist_converter() -> convert.Converter(UpsertPlaylist) {
  convert.object({
    use name <- convert.parameter
    use <- convert.constructor
    UpsertPlaylist(name:)
  })
  |> convert.field("name", fn(v) { Ok(v.name) }, convert.string())
  |> convert.to_converter
}
