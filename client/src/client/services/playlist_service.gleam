import client/services/factory
import client/types/msg
import glitr_lustre
import shared/routes/playlist_routes
import shared/types/playlist
import utils

pub fn get_all() {
  use route <- utils.unwrap_service_route(playlist_routes.get_all())

  factory.factory()
  |> glitr_lustre.for_route(route)
  |> glitr_lustre.with_path(Nil)
  |> utils.send_and_handle_errors(msg.ServerSentPlaylists)
}

pub fn get(id: String) {
  use route <- utils.unwrap_service_route(playlist_routes.get())

  factory.factory()
  |> glitr_lustre.for_route(route)
  |> glitr_lustre.with_path(id)
  |> utils.send_and_handle_errors(msg.ServerSentPlaylist)
}

pub fn create(name: String) {
  use route <- utils.unwrap_service_route(playlist_routes.create())

  factory.factory()
  |> glitr_lustre.for_route(route)
  |> glitr_lustre.with_path(Nil)
  |> glitr_lustre.with_body(playlist.UpsertPlaylist(name))
  |> utils.send_and_handle_errors(msg.ServerCreatedPlaylist)
}

pub fn update(id: String, name: String) {
  use route <- utils.unwrap_service_route(playlist_routes.update())

  factory.factory()
  |> glitr_lustre.for_route(route)
  |> glitr_lustre.with_path(id)
  |> glitr_lustre.with_body(playlist.UpsertPlaylist(name))
  |> utils.send_and_handle_errors(msg.ServerUpdatedPlaylist)
}

pub fn delete(id: String) {
  use route <- utils.unwrap_service_route(playlist_routes.delete())

  factory.factory()
  |> glitr_lustre.for_route(route)
  |> glitr_lustre.with_path(id)
  |> utils.send_and_handle_errors(msg.ServerDeletedPlaylist)
}
