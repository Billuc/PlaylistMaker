import client/types/route
import gleam/uri.{type Uri}

pub fn map_route(uri: Uri) -> route.Route {
  case uri.path_segments(uri.path) {
    [] -> route.Home
    ["search"] -> route.Search(False, [])
    ["playlists", id] -> route.Playlist(id)
    _ -> route.Login
  }
}
