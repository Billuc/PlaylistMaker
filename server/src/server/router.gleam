import gleam/bool
import glitr_wisp
import server/services/authentication_service
import server/services/song_service
import server/web
import shared/routes/authentication_routes
import shared/routes/song_routes
import wisp.{type Request, type Response}

pub fn handle_request(req: Request, ctx: web.Context) -> Response {
  use _req <- web.middleware(req)

  let assert Ok(priv) = wisp.priv_directory("server")
  let static_dir = priv <> "/static"
  use <- wisp.serve_static(req, under: "/", from: static_dir)

  use <- bool.guard(
    req.path == "/",
    wisp.ok() |> wisp.set_body(wisp.File(static_dir <> "/index.html")),
  )

  glitr_wisp.for(req)
  |> glitr_wisp.try(song_routes.search(), song_service.search(ctx, _))
  |> glitr_wisp.try_map(
    authentication_routes.login(),
    fn(_) { Ok(Nil) },
    authentication_service.login(ctx, req, _),
  )
  |> glitr_wisp.try(
    authentication_routes.callback(),
    authentication_service.callback(ctx, req, _),
  )
  |> glitr_wisp.unwrap
}
