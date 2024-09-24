import glitr/error
import glitr/route
import glitr/service
import shared/types/playlist

pub fn playlist_service() -> service.RouteService(
  playlist.Playlist,
  playlist.UpsertPlaylist,
) {
  service.new()
  |> service.with_root_path(["playlists"])
  |> service.with_base_type(
    playlist.playlist_encoder,
    playlist.playlist_decoder,
  )
  |> service.with_upsert_type(
    playlist.upsert_playlist_encoder,
    playlist.upsert_playlist_decoder,
  )
}

pub fn get() -> Result(
  route.Route(String, Nil, Nil, playlist.Playlist),
  error.GlitrError,
) {
  playlist_service() |> service.get_route()
}

pub fn get_all() -> Result(
  route.Route(Nil, Nil, Nil, List(playlist.Playlist)),
  error.GlitrError,
) {
  playlist_service() |> service.get_all_route()
}

pub fn create() -> Result(
  route.Route(Nil, Nil, playlist.UpsertPlaylist, playlist.Playlist),
  error.GlitrError,
) {
  playlist_service() |> service.create_route()
}

pub fn update() -> Result(
  route.Route(String, Nil, playlist.UpsertPlaylist, playlist.Playlist),
  error.GlitrError,
) {
  playlist_service() |> service.update_route()
}

pub fn delete() -> Result(
  route.Route(String, Nil, Nil, String),
  error.GlitrError,
) {
  playlist_service() |> service.delete_route()
}
