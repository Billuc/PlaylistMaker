import cake/delete as d
import cake/insert as i
import cake/select as s
import cake/update as u
import cake/where as w
import gleam/list
import gleam/result
import glitr_wisp/errors
import gluid
import server/utils/db_utils
import server/web
import shared/types/playlist

const db_name = "playlists"

pub fn get_all(
  ctx: web.Context,
) -> Result(List(playlist.Playlist), errors.AppError) {
  s.new()
  |> s.all()
  |> s.from_table(db_name)
  |> s.to_query()
  |> db_utils.exec_read_query(ctx.db, playlist.db_decoder)
}

pub fn get(
  ctx: web.Context,
  id: String,
) -> Result(playlist.Playlist, errors.AppError) {
  s.new()
  |> s.selects([s.col("id"), s.col("name")])
  |> s.from_table(db_name)
  |> s.where(w.col("id") |> w.eq(w.string(id)))
  |> s.to_query()
  |> db_utils.exec_read_query(ctx.db, playlist.db_decoder)
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
  create: playlist.UpsertPlaylist,
) -> Result(String, errors.AppError) {
  let id = gluid.guidv4()

  i.new()
  |> i.table(db_name)
  |> i.columns(["id", "name"])
  |> i.source_values([i.row([i.string(id), i.string(create.name)])])
  |> i.to_query
  |> db_utils.exec_write_query(ctx.db, Ok)
  |> result.replace(id)
}

pub fn update(
  ctx: web.Context,
  update: playlist.UpsertPlaylist,
  id: String,
) -> Result(String, errors.AppError) {
  u.new()
  |> u.table(db_name)
  |> u.sets([u.set_string("name", update.name)])
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
