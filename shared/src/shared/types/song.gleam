import gleam/option
import glitr/convert

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

pub fn song_source_converter() -> convert.Converter(SongSource) {
  let youtube_source_converter =
    convert.object({
      use url <- convert.parameter
      use <- convert.constructor
      Youtube(url)
    })
    |> convert.field(
      "url",
      fn(v) {
        case v {
          Youtube(url) -> Ok(url)
          _ -> Error(Nil)
        }
      },
      convert.string(),
    )
    |> convert.to_converter

  let spotify_source_converter =
    convert.object({
      use url <- convert.parameter
      use <- convert.constructor
      Spotify(url)
    })
    |> convert.field(
      "url",
      fn(v) {
        case v {
          Spotify(url) -> Ok(url)
          _ -> Error(Nil)
        }
      },
      convert.string(),
    )
    |> convert.to_converter

  convert.enum(
    fn(v) {
      case v {
        Spotify(_) -> "spotify"
        Youtube(_) -> "youtube"
      }
    },
    [
      #("spotify", spotify_source_converter),
      #("youtube", youtube_source_converter),
    ],
  )
}

pub fn song_converter() -> convert.Converter(Song) {
  convert.object({
    use id <- convert.parameter
    use title <- convert.parameter
    use artists <- convert.parameter
    use album <- convert.parameter
    use album_cover <- convert.parameter
    use source <- convert.parameter
    use preview_url <- convert.parameter
    use <- convert.constructor
    Song(id:, title:, artists:, album:, album_cover:, source:, preview_url:)
  })
  |> convert.field("id", fn(v) { Ok(v.id) }, convert.string())
  |> convert.field("title", fn(v) { Ok(v.title) }, convert.string())
  |> convert.field(
    "artists",
    fn(v) { Ok(v.artists) },
    convert.list(convert.string()),
  )
  |> convert.field("album", fn(v) { Ok(v.album) }, convert.string())
  |> convert.field("album_cover", fn(v) { Ok(v.album_cover) }, convert.string())
  |> convert.field("source", fn(v) { Ok(v.source) }, song_source_converter())
  |> convert.field(
    "preview_url",
    fn(v) { Ok(v.preview_url) },
    convert.optional(convert.string()),
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
    source: SongSource,
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
  |> convert.field("source", fn(v) { Ok(v.source) }, song_source_converter())
  |> convert.to_converter
}
