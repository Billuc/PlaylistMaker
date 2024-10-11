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

pub type PlaylistDTO {
  PlaylistDTO(id: String, name: String)
}

pub fn playlist_dto_converter() -> convert.Converter(PlaylistDTO) {
  convert.object({
    use id <- convert.parameter
    use name <- convert.parameter
    use <- convert.constructor
    PlaylistDTO(id:, name:)
  })
  |> convert.field("id", fn(v) { Ok(v.id) }, convert.string())
  |> convert.field("name", fn(v) { Ok(v.name) }, convert.string())
  |> convert.to_converter
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
