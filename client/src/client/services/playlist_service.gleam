import client/events/playlist_events
import client/services/factory
import client/types/msg
import glitr/lustre as gl
import shared/routes/playlist_routes
import shared/types/playlist
import utils

pub fn get_all() {
  factory.factory()
  |> gl.for_route(playlist_routes.get_all())
  |> gl.with_path(Nil)
  |> utils.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerSentPlaylists(d))
  })
}

pub fn get(id: String) {
  factory.factory()
  |> gl.for_route(playlist_routes.get())
  |> gl.with_path(id)
  |> utils.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerSentPlaylist(d))
  })
}

pub fn create(name: String) {
  factory.factory()
  |> gl.for_route(playlist_routes.create())
  |> gl.with_path(Nil)
  |> gl.with_body(playlist.UpsertPlaylist(name))
  |> utils.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerCreatedPlaylist(d))
  })
}

pub fn update(id: String, name: String) {
  factory.factory()
  |> gl.for_route(playlist_routes.update())
  |> gl.with_path(id)
  |> gl.with_body(playlist.UpsertPlaylist(name))
  |> utils.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerUpdatedPlaylist(d))
  })
}

pub fn delete(id: String) {
  factory.factory()
  |> gl.for_route(playlist_routes.delete())
  |> gl.with_path(id)
  |> utils.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerDeletedPlaylist(d))
  })
}
