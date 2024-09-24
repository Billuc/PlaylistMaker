import gleam/dict
import shared/types/playlist
import shared/types/song

pub type Model {
  Model(
    token: String,
    last_search: String,
    searching: Bool,
    results: List(song.Song),
    playlists: dict.Dict(String, playlist.Playlist),
  )
}
