import client/events/playlist_events
import client/services/server
import client/types/msg
import glitr/lustre as gl
import shared/routes/playlist_routes
import shared/types/playlist

pub fn get_all() {
  server.request_factory()
  |> gl.for_route(playlist_routes.get_all())
  |> server.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerSentPlaylists(d))
  })
}

pub fn get(id: String) {
  server.request_factory()
  |> gl.for_route(playlist_routes.get())
  |> gl.with_path(id)
  |> server.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerSentPlaylist(d))
  })
}

pub fn create(name: String) {
  server.request_factory()
  |> gl.for_route(playlist_routes.create())
  |> gl.with_body(playlist.UpsertPlaylist(name))
  |> server.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerCreatedPlaylist(d))
  })
}

pub fn update(id: String, name: String) {
  server.request_factory()
  |> gl.for_route(playlist_routes.update())
  |> gl.with_path(id)
  |> gl.with_body(playlist.UpsertPlaylist(name))
  |> server.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerUpdatedPlaylist(d))
  })
}

pub fn delete(id: String) {
  server.request_factory()
  |> gl.for_route(playlist_routes.delete())
  |> gl.with_path(id)
  |> server.send_and_handle_errors(fn(d) {
    msg.PlaylistEvent(playlist_events.ServerDeletedPlaylist(d))
  })
}
