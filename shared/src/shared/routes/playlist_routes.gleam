import glitr/route
import glitr/service
import shared/types/playlist

pub fn playlist_service() -> service.RouteService(
  playlist.Playlist,
  playlist.UpsertPlaylist,
) {
  service.new()
  |> service.with_root_path(["api", "playlists"])
  |> service.with_base_converter(playlist.playlist_converter())
  |> service.with_upsert_converter(playlist.upsert_playlist_converter())
}

pub fn get() -> route.Route(String, Nil, Nil, playlist.Playlist) {
  playlist_service() |> service.get_route()
}

pub fn get_all() -> route.Route(Nil, Nil, Nil, List(playlist.Playlist)) {
  playlist_service() |> service.get_all_route()
}

pub fn create() -> route.Route(
  Nil,
  Nil,
  playlist.UpsertPlaylist,
  playlist.Playlist,
) {
  playlist_service() |> service.create_route()
}

pub fn update() -> route.Route(
  String,
  Nil,
  playlist.UpsertPlaylist,
  playlist.Playlist,
) {
  playlist_service() |> service.update_route()
}

pub fn delete() -> route.Route(String, Nil, Nil, String) {
  playlist_service() |> service.delete_route()
}
