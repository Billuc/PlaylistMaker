import shared/types/playlist

pub type PlaylistEvent {
  CreatePlaylist(name: String)
  UpdatePlaylist(id: String, name: String)
  DeletePlaylist(id: String)
  ServerSentPlaylists(playlists: List(playlist.Playlist))
  ServerSentPlaylist(playlist: playlist.Playlist)
  ServerCreatedPlaylist(playlist: playlist.Playlist)
  ServerUpdatedPlaylist(playlist: playlist.Playlist)
  ServerDeletedPlaylist(id: String)
}
