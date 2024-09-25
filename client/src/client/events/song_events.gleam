import shared/types/song

pub type SongEvent {
  SearchSongs(search: String)
  ServerSentSongs(results: List(song.Song))
  PlayPreview(preview_url: String)
}
