import shared/types/song

pub type Route {
  Home
  Login
  Playlist(id: String)
  Search(searching: Bool, results: List(song.Song))
}
