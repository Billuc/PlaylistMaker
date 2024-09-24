import client/types/msg
import client/types/route
import gleam/uri.{type Uri}

pub fn on_url_change(uri: Uri) -> msg.Msg {
  case uri.path_segments(uri.path) {
    [] -> msg.OnRouteChange(route.Login)
    ["search"] -> msg.OnRouteChange(route.Search(False, []))
    ["playlists", id] -> msg.OnRouteChange(route.Playlist(id))
    _ -> msg.OnRouteChange(route.Login)
  }
}
