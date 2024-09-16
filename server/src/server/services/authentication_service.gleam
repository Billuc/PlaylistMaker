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
        |> list.map(fn(kv) { url_encode(kv.0) <> "=" <> url_encode(kv.1) })
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

pub fn url_encode(input: String) -> String {
  input
  |> string.replace(" ", "%20")
  |> string.replace("!", "%21")
  // |> string.replace("\"", "%22")
  |> string.replace("#", "%23")
  |> string.replace("$", "%24")
  |> string.replace("%", "%25")
  |> string.replace("&", "%26")
  |> string.replace("'", "%27")
  |> string.replace("(", "%28")
  |> string.replace(")", "%29")
  |> string.replace("*", "%2A")
  |> string.replace("+", "%2B")
  |> string.replace(",", "%2C")
  // |> string.replace("-", "%2D") 
  // |> string.replace(".", "%2E")
  |> string.replace("/", "%2F")
  |> string.replace(":", "%3A")
  |> string.replace(";", "%3B")
  // |> string.replace("<", "%3C")
  |> string.replace("=", "%3D")
  // |> string.replace(">", "%3E")
  |> string.replace("?", "%3F")
  |> string.replace("@", "%40")
  |> string.replace("[", "%5B")
  // |> string.replace("\\", "%5C")
  |> string.replace("]", "%5D")
  // |> string.replace("^", "%5E")
  // |> string.replace("_", "%5F")
  // |> string.replace("`", "%60")
}
