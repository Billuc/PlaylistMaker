import cake/delete as d
import cake/insert as i
import cake/select as s
import cake/update as u
import cake/where as w
import gleam/list
import gleam/result
import glitr/convert/cake as cc
import glitr/wisp/errors
import gluid
import server/utils/db_utils
import server/web
import shared/types/playlist_song

const db_name = "playlist_songs"

pub fn get_all(
  ctx: web.Context,
) -> Result(List(playlist_song.PlaylistSong), errors.AppError) {
  s.new()
  |> cc.cake_select_fields(playlist_song.playlist_song_converter())
  |> s.from_table(db_name)
  |> s.to_query()
  |> db_utils.exec_read_query(
    ctx.db,
    cc.cake_decode(playlist_song.playlist_song_converter()),
  )
}

pub fn get(
  ctx: web.Context,
  id: String,
) -> Result(playlist_song.PlaylistSong, errors.AppError) {
  s.new()
  |> cc.cake_select_fields(playlist_song.playlist_song_converter())
  |> s.from_table(db_name)
  |> s.where(w.col("id") |> w.eq(w.string(id)))
  |> s.to_query()
  |> db_utils.exec_read_query(
    ctx.db,
    cc.cake_decode(playlist_song.playlist_song_converter()),
  )
  |> result.then(fn(res) {
    res
    |> list.first
    |> result.replace_error(errors.DBError(
      "Couldn't find playlist with id " <> id,
    ))
  })
}

pub fn create(
  ctx: web.Context,
  create: playlist_song.UpsertPlaylistSong,
) -> Result(String, errors.AppError) {
  let id = gluid.guidv4()

  i.new()
  |> i.table(db_name)
  |> cc.cake_insert(playlist_song.playlist_song_converter(), [
    playlist_song.playlist_song_from_upsert(id, create),
  ])
  |> i.to_query
  |> db_utils.exec_write_query(ctx.db, Ok)
  |> result.replace(id)
}

pub fn update(
  ctx: web.Context,
  update: playlist_song.UpsertPlaylistSong,
  id: String,
) -> Result(String, errors.AppError) {
  u.new()
  |> u.table(db_name)
  |> cc.cake_update(
    playlist_song.playlist_song_converter(),
    playlist_song.playlist_song_from_upsert(id, update),
  )
  |> u.where(w.col("id") |> w.eq(w.string(id)))
  |> u.to_query
  |> db_utils.exec_write_query(ctx.db, Ok)
  |> result.replace(id)
}

pub fn delete(ctx: web.Context, id: String) -> Result(String, errors.AppError) {
  d.new()
  |> d.table(db_name)
  |> d.where(w.col("id") |> w.eq(w.string(id)))
  |> d.to_query
  |> db_utils.exec_write_query(ctx.db, Ok)
  |> result.replace(id)
}
