import dot_env
import dot_env/env
import gleam/erlang/process
import gleam/option
import gleam/result
import mist
import server/db
import server/router
import server/web
import wisp
import wisp/wisp_mist

pub fn main() {
  wisp.configure_logger()

  let secret_key_base = wisp.random_string(64)
  dot_env.load_default()

  let assert Ok(client_id) = env.get_string("CLIENT_ID")
  let assert Ok(client_secret) = env.get_string("CLIENT_SECRET")
  let assert Ok(db_host) = env.get_string("DB_HOST")
  let assert Ok(db_port) = env.get_int("DB_PORT")
  let assert Ok(db_user) = env.get_string("DB_USER")
  let db_password =
    env.get_string("DB_PASSWORD")
    |> result.map(option.Some)
    |> result.unwrap(option.None)
  let assert Ok(db_database) = env.get_string("DB_DATABASE")

  use db <- db.get_db(db.DbInfos(
    db_host,
    db_port,
    db_user,
    db_password,
    db_database,
  ))

  let context = web.Context(client_id, client_secret, db, secret_key_base)
  let handler = router.handle_request(_, context)
  let assert Ok(_) =
    handler
    |> wisp_mist.handler(secret_key_base)
    |> mist.new
    |> mist.port(2345)
    |> mist.start_http

  process.sleep_forever()
}
