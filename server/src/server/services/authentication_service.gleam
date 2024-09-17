import gleam/bit_array
import gleam/bool
import gleam/dynamic
import gleam/http
import gleam/http/request
import gleam/httpc
import gleam/json
import gleam/list
import gleam/option
import gleam/result
import gleam/string
import gleam/string_builder
import gleam/uri
import glitr
import glitr_wisp/errors
import pprint
import server/web
import shared/routes/authentication_routes
import wisp

pub fn login(
  ctx: web.Context,
  req: wisp.Request,
  _res: wisp.Response,
) -> wisp.Response {
  let state = wisp.random_string(16)
  let scope = ""

  wisp.redirect(
    request.new()
    |> request.set_scheme(http.Https)
    |> request.set_host("accounts.spotify.com")
    |> request.set_path("authorize")
    |> request.set_query([
      #("response_type", "code"),
      #("client_id", ctx.client_id),
      #("scope", scope),
      #(
        "redirect_uri",
        req
          |> request.set_path("callback")
          |> request.set_body(Nil)
          |> request.to_uri
          |> fn(uri) { uri.Uri(..uri, query: option.None) }
          |> uri.to_string,
      ),
      #("state", state),
    ])
    |> request.to_uri
    |> uri.to_string,
  )
}

pub fn callback(
  ctx: web.Context,
  req: wisp.Request,
  opts: glitr.RouteOptions(Nil, authentication_routes.CallbackQuery, Nil),
) -> Result(String, errors.AppError) {
  use <- bool.guard(
    option.is_some(opts.query.error),
    Error(errors.InternalError(opts.query.error |> option.unwrap(""))),
  )
  use <- bool.guard(
    string.is_empty(opts.query.state),
    Error(errors.InternalError("State mismatch")),
  )

  case opts.query.code {
    option.None -> Error(errors.InternalError("No code provided"))
    option.Some(code) -> {
      request.new()
      |> request.set_scheme(http.Https)
      |> request.set_method(http.Post)
      |> request.set_host("accounts.spotify.com")
      |> request.set_path("api/token")
      |> request.set_body(
        [
          #("code", code),
          #(
            "redirect_uri",
            req
              |> request.to_uri
              |> fn(uri) { uri.Uri(..uri, query: option.None) }
              |> uri.to_string,
          ),
          #("grant_type", "authorization_code"),
        ]
        |> list.map(fn(kv) {
          uri.percent_encode(kv.0) <> "=" <> uri.percent_encode(kv.1)
        })
        |> string.join("&"),
      )
      |> request.set_header("content-type", "application/x-www-form-urlencoded")
      |> request.set_header(
        "Authorization",
        "Basic "
          <> bit_array.from_string(ctx.client_id <> ":" <> ctx.client_secret)
        |> bit_array.base64_url_encode(True),
      )
      |> pprint.debug
      |> httpc.send
      |> result.replace_error(errors.InternalError("Error while getting token"))
      |> pprint.debug
      |> result.then(fn(res) {
        res.body
        |> json.decode(dynamic.field("access_token", dynamic.string))
        |> result.replace_error(errors.InternalError(res.body))
      })
    }
  }
}

pub fn callback_redirect(req: wisp.Request, res: wisp.Response) -> wisp.Response {
  use <- bool.guard(res.status != 200, res)

  case res.body {
    wisp.Text(token) ->
      wisp.redirect(
        req
        |> request.set_path("")
        |> request.set_query([#("token", string_builder.to_string(token))])
        |> request.to_uri
        |> uri.to_string,
      )
    _ -> res
  }
}
