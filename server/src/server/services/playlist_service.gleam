import gleam/result
import glitr
import glitr_wisp/errors
import server/repositories/playlist_repository
import server/web
import shared/types/playlist

pub fn get_all(
  ctx: web.Context,
  _opts: glitr.RouteOptions(Nil, Nil, Nil),
) -> Result(List(playlist.Playlist), errors.AppError) {
  playlist_repository.get_all(ctx)
}

pub fn get(
  ctx: web.Context,
  opts: glitr.RouteOptions(String, Nil, Nil),
) -> Result(playlist.Playlist, errors.AppError) {
  playlist_repository.get(ctx, opts.path)
}

pub fn create(
  ctx: web.Context,
  opts: glitr.RouteOptions(Nil, Nil, playlist.UpsertPlaylist),
) -> Result(playlist.Playlist, errors.AppError) {
  playlist_repository.create(ctx, opts.body)
  |> result.then(playlist_repository.get(ctx, _))
}

pub fn update(
  ctx: web.Context,
  opts: glitr.RouteOptions(String, Nil, playlist.UpsertPlaylist),
) -> Result(playlist.Playlist, errors.AppError) {
  playlist_repository.update(ctx, opts.body, opts.path)
  |> result.then(playlist_repository.get(ctx, _))
}

pub fn delete(
  ctx: web.Context,
  opts: glitr.RouteOptions(String, Nil, Nil),
) -> Result(String, errors.AppError) {
  playlist_repository.delete(ctx, opts.path)
}
