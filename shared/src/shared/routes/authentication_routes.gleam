import gleam/http
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string_builder
import glitr/body
import glitr/path
import glitr/query
import glitr/route

pub fn login() -> route.Route(Nil, Nil, Nil, Nil) {
  route.new()
  |> route.with_method(http.Get)
  |> route.with_path(path.static_path(["login"]))
}

pub fn callback() -> route.Route(Nil, CallbackQuery, Nil, String) {
  route.new()
  |> route.with_method(http.Get)
  |> route.with_path(path.static_path(["callback"]))
  |> route.with_query(
    query.complex_query(query.QueryConverter(callback_encoder, callback_decoder)),
  )
  |> route.with_response_body(
    body.string_body(body.BodyConverter(string_builder.from_string, Ok)),
  )
}

pub type CallbackQuery {
  CallbackQuery(state: String, error: Option(String), code: Option(String))
}

pub fn callback_encoder(q: CallbackQuery) -> List(#(String, String)) {
  case q {
    CallbackQuery(s, Some(e), _) -> [#("state", s), #("error", e)]
    CallbackQuery(s, _, Some(c)) -> [#("state", s), #("code", c)]
    _ -> []
  }
}

pub fn callback_decoder(
  q: List(#(String, String)),
) -> Result(CallbackQuery, Nil) {
  use state <- result.try(list.key_find(q, "state"))
  use code <- result.try(list.key_find(q, "code"))

  Ok(CallbackQuery(state, None, Some(code)))
}

pub type RedirectQuery {
  RedirectQuery(
    response_type: String,
    client_id: String,
    scope: String,
    redirect_uri: String,
    state: String,
  )
}
