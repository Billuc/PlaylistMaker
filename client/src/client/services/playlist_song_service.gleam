import client/events/playlist_song_events
import client/services/server
import client/types/msg
import glitr/lustre as gl
import shared/routes/playlist_song_routes
import shared/types/playlist_song

pub fn create(data: playlist_song.UpsertPlaylistSong) {
  server.request_factory()
  |> gl.for_route(playlist_song_routes.create())
  |> gl.with_body(data)
  |> server.send_and_handle_errors(fn(d) {
    msg.PlaylistSongEvent(playlist_song_events.ServerCreatedPlaylistSong(d))
  })
}

pub fn delete(id: String) {
  server.request_factory()
  |> gl.for_route(playlist_song_routes.delete())
  |> gl.with_path(id)
  |> server.send_and_handle_errors(fn(d) {
    msg.PlaylistSongEvent(playlist_song_events.ServerDeletedPlaylistSong(d))
  })
}
