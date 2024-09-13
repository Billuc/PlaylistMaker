import shared/types/song

pub type Playlist {
  Playlist(name: String, songs: List(song.Song))
}
