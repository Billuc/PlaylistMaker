import gleam/list
import gleam/option
import gleam/result
import gleam/uri
import plinth/browser/window
import plinth/javascript/console
import plinth/javascript/storage

pub fn get_token() -> String {
  let token =
    get_token_from_uri()
    |> result.try_recover(fn(err) {
      console.warn(err)
      get_token_from_storage()
    })

  case token {
    Ok(t) -> {
      set_token_in_storage(t)
      t
    }
    Error(err) -> {
      console.warn(err)
      ""
    }
  }
}

fn get_token_from_uri() -> Result(String, String) {
  use uri <- result.try(
    uri.parse(window.location())
    |> result.replace_error("Couldn't parse window's uri"),
  )

  uri
  |> fn(uri: uri.Uri) { uri.parse_query(uri.query |> option.unwrap("")) }
  |> result.then(fn(q) { q |> list.key_find("token") })
  |> result.replace_error("Couldn't get token from URI")
}

fn get_token_from_storage() -> Result(String, String) {
  use storage <- result.try(
    storage.session() |> result.replace_error("Couldn't access local storage"),
  )

  storage
  |> storage.get_item("SpotifyToken")
  |> result.replace_error("Couldn't get token from local storage")
}

fn set_token_in_storage(token: String) -> Nil {
  case storage.session() {
    Error(_) -> console.log("Couldn't access local storage")
    Ok(sto) -> {
      sto
      |> storage.set_item("SpotifyToken", token)
      |> result.try_recover(fn(_) {
        console.warn("Couldn't store token in local storage")
        Error(Nil)
      })
      |> result.unwrap_both()
    }
  }
}
