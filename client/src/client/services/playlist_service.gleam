import client/services/factory
import client/types/msg
import glitr_lustre
import shared/routes/playlist_routes
import utils

pub fn get_all() {
  use route <- utils.unwrap_service_route(playlist_routes.get_all())

  factory.factory()
  |> glitr_lustre.for_route(route)
  |> glitr_lustre.with_path(Nil)
  |> utils.send_and_handle_errors(msg.ServerSentPlaylists)
}
