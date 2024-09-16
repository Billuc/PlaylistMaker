import dot_env
import dot_env/env
import gleam/erlang/process
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
  // use db <- db.get_db()

  let context = web.Context(client_id, client_secret, secret_key_base)
  let handler = router.handle_request(_, context)
  let assert Ok(_) =
    handler
    |> wisp_mist.handler(secret_key_base)
    |> mist.new
    |> mist.port(2345)
    |> mist.start_http

  process.sleep_forever()
}
