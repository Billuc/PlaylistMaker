import gleam/list
import gleam/result
import glitr
import glitr/wisp/errors
import server/repositories/playlist_repository
import server/repositories/playlist_song_repository
import server/web
import shared/types/playlist

pub fn get_all(
  ctx: web.Context,
  _opts: glitr.RouteOptions(Nil, Nil, Nil),
) -> Result(List(playlist.Playlist), errors.AppError) {
  playlist_repository.get_all(ctx)
  |> result.map(fn(dtos) {
    list.map(dtos, fn(dto) {
      let songs =
        playlist_song_repository.get_by_playlist(ctx, dto.id)
        |> result.unwrap([])
      playlist.Playlist(dto.id, dto.name, songs)
    })
  })
}

pub fn get(
  ctx: web.Context,
  opts: glitr.RouteOptions(String, Nil, Nil),
) -> Result(playlist.Playlist, errors.AppError) {
  let songs =
    playlist_song_repository.get_by_playlist(ctx, opts.path)
    |> result.unwrap([])

  playlist_repository.get(ctx, opts.path)
  |> result.map(fn(dto) { playlist.Playlist(dto.id, dto.name, songs) })
}

pub fn create(
  ctx: web.Context,
  opts: glitr.RouteOptions(Nil, Nil, playlist.UpsertPlaylist),
) -> Result(playlist.Playlist, errors.AppError) {
  playlist_repository.create(ctx, opts.body)
  |> result.then(fn(id) { get(ctx, glitr.RouteOptions(id, Nil, Nil)) })
}

pub fn update(
  ctx: web.Context,
  opts: glitr.RouteOptions(String, Nil, playlist.UpsertPlaylist),
) -> Result(playlist.Playlist, errors.AppError) {
  playlist_repository.update(ctx, opts.body, opts.path)
  |> result.then(fn(id) { get(ctx, glitr.RouteOptions(id, Nil, Nil)) })
}

pub fn delete(
  ctx: web.Context,
  opts: glitr.RouteOptions(String, Nil, Nil),
) -> Result(String, errors.AppError) {
  playlist_repository.delete(ctx, opts.path)
}
