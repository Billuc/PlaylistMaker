import client/events/playlist_song_events
import client/services/factory
import client/types/msg
import glitr/lustre as gl
import shared/routes/playlist_song_routes
import shared/types/playlist_song
import utils

pub fn create(data: playlist_song.UpsertPlaylistSong) {
  factory.factory()
  |> gl.for_route(playlist_song_routes.create())
  |> gl.with_path(Nil)
  |> gl.with_body(data)
  |> utils.send_and_handle_errors(fn(d) {
    msg.PlaylistSongEvent(playlist_song_events.ServerCreatedPlaylistSong(d))
  })
}

pub fn delete(id: String) {
  factory.factory()
  |> gl.for_route(playlist_song_routes.delete())
  |> gl.with_path(id)
  |> utils.send_and_handle_errors(fn(d) {
    msg.PlaylistSongEvent(playlist_song_events.ServerDeletedPlaylistSong(d))
  })
}
