import glitr/convert
import shared/types/song

pub type PlaylistSong {
  PlaylistSong(
    id: String,
    playlist_id: String,
    song_id: String,
    title: String,
    artists: List(String),
    album: String,
    album_cover: String,
    source: song.SongSource,
  )
}

pub fn playlist_song_converter() -> convert.Converter(PlaylistSong) {
  convert.object({
    use id <- convert.parameter
    use playlist_id <- convert.parameter
    use song_id <- convert.parameter
    use title <- convert.parameter
    use artists <- convert.parameter
    use album <- convert.parameter
    use album_cover <- convert.parameter
    use source <- convert.parameter
    use <- convert.constructor
    PlaylistSong(
      id:,
      playlist_id:,
      song_id:,
      title:,
      artists:,
      album:,
      album_cover:,
      source:,
    )
  })
  |> convert.field("id", fn(v) { Ok(v.id) }, convert.string())
  |> convert.field("playlist_id", fn(v) { Ok(v.playlist_id) }, convert.string())
  |> convert.field("song_id", fn(v) { Ok(v.song_id) }, convert.string())
  |> convert.field("title", fn(v) { Ok(v.title) }, convert.string())
  |> convert.field(
    "artists",
    fn(v) { Ok(v.artists) },
    convert.list(convert.string()),
  )
  |> convert.field("album", fn(v) { Ok(v.album) }, convert.string())
  |> convert.field("album_cover", fn(v) { Ok(v.album_cover) }, convert.string())
  |> convert.field(
    "source",
    fn(v) { Ok(v.source) },
    song.song_source_converter(),
  )
  |> convert.to_converter
}

pub type UpsertPlaylistSong {
  UpsertPlaylistSong(
    playlist_id: String,
    song_id: String,
    title: String,
    artists: List(String),
    album: String,
    album_cover: String,
    source: song.SongSource,
  )
}

pub fn upsert_converter() -> convert.Converter(UpsertPlaylistSong) {
  convert.object({
    use playlist_id <- convert.parameter
    use song_id <- convert.parameter
    use title <- convert.parameter
    use artists <- convert.parameter
    use album <- convert.parameter
    use album_cover <- convert.parameter
    use source <- convert.parameter
    use <- convert.constructor
    UpsertPlaylistSong(
      playlist_id:,
      song_id:,
      title:,
      artists:,
      album:,
      album_cover:,
      source:,
    )
  })
  |> convert.field("playlist_id", fn(v) { Ok(v.playlist_id) }, convert.string())
  |> convert.field("song_id", fn(v) { Ok(v.song_id) }, convert.string())
  |> convert.field("title", fn(v) { Ok(v.title) }, convert.string())
  |> convert.field(
    "artists",
    fn(v) { Ok(v.artists) },
    convert.list(convert.string()),
  )
  |> convert.field("album", fn(v) { Ok(v.album) }, convert.string())
  |> convert.field("album_cover", fn(v) { Ok(v.album_cover) }, convert.string())
  |> convert.field(
    "source",
    fn(v) { Ok(v.source) },
    song.song_source_converter(),
  )
  |> convert.to_converter
}

pub fn playlist_song_from_upsert(
  id: String,
  upsert: UpsertPlaylistSong,
) -> PlaylistSong {
  PlaylistSong(
    id,
    upsert.playlist_id,
    upsert.song_id,
    upsert.title,
    upsert.artists,
    upsert.album,
    upsert.album_cover,
    upsert.source,
  )
}
