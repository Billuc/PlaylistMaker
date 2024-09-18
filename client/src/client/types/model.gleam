import shared/types/playlist
import shared/types/song

pub type Model {
  Model(
    token: String,
    last_search: String,
    searching: Bool,
    results: List(song.Song),
    playlists: List(#(String, playlist.Playlist)),
  )
}
