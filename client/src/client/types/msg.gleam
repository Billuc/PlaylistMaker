import lustre_http
import shared/types/playlist
import shared/types/song

pub type Msg {
  SearchSongs(search: String)
  ServerSentSongs(results: List(song.Song))
  ServerError(error: lustre_http.HttpError)
  ClientError(message: String)
  PlayPreview(preview_url: String)
  ServerSentPlaylists(playlists: List(playlist.Playlist))
  OpenDialog(id: String)
  CloseDialog(id: String)
  CreatePlaylist(name: String)
  ServerSentPlaylist(playlist: playlist.Playlist)
  ServerCreatedPlaylist(playlist: playlist.Playlist)
  ServerUpdatedPlaylist(playlist: playlist.Playlist)
  ServerDeletedPlaylist(id: String)
}
