import shared/types/playlist_song

pub type PlaylistSongEvent {
  CreatePlaylistSong(data: playlist_song.UpsertPlaylistSong)
  CreatePlaylistSongFromCurrentSong(playlist_id: String)
  DeletePlaylistSong(id: String)
  ServerCreatedPlaylistSong(song: playlist_song.PlaylistSong)
  ServerDeletedPlaylistSong(id: String)
}
