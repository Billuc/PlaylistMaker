import glitr/route
import glitr/service
import shared/types/playlist_song

pub fn playlist_song_service() -> service.RouteService(
  playlist_song.PlaylistSong,
  playlist_song.UpsertPlaylistSong,
) {
  service.new()
  |> service.with_root_path(["api", "playlist-songs"])
  |> service.with_base_converter(playlist_song.playlist_song_converter())
  |> service.with_upsert_converter(playlist_song.upsert_converter())
}

pub fn get() -> route.Route(String, Nil, Nil, playlist_song.PlaylistSong) {
  playlist_song_service() |> service.get_route()
}

pub fn get_all() -> route.Route(Nil, Nil, Nil, List(playlist_song.PlaylistSong)) {
  playlist_song_service() |> service.get_all_route()
}

pub fn create() -> route.Route(
  Nil,
  Nil,
  playlist_song.UpsertPlaylistSong,
  playlist_song.PlaylistSong,
) {
  playlist_song_service() |> service.create_route()
}

pub fn update() -> route.Route(
  String,
  Nil,
  playlist_song.UpsertPlaylistSong,
  playlist_song.PlaylistSong,
) {
  playlist_song_service() |> service.update_route()
}

pub fn delete() -> route.Route(String, Nil, Nil, String) {
  playlist_song_service() |> service.delete_route()
}
