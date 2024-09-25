import glitr/path
import glitr/route
import glitr_wisp
import server/services/authentication_service
import server/services/playlist_service
import server/services/song_service
import server/web
import shared/routes/authentication_routes
import shared/routes/playlist_routes
import shared/routes/song_routes
import wisp.{type Request, type Response}

pub fn handle_request(req: Request, ctx: web.Context) -> Response {
  use _req <- web.middleware(req)

  let assert Ok(priv) = wisp.priv_directory("server")
  let static_dir = priv <> "/static"
  use <- wisp.serve_static(req, under: "/", from: static_dir)

  let index_response =
    wisp.ok() |> wisp.set_body(wisp.File(static_dir <> "/index.html"))

  glitr_wisp.for(req)
  |> glitr_wisp.try(song_routes.search(), song_service.search(ctx, _))
  |> glitr_wisp.try_map(
    authentication_routes.login(),
    fn(_) { Ok(Nil) },
    authentication_service.login(ctx, req, _),
  )
  |> glitr_wisp.try_map(
    authentication_routes.callback(),
    authentication_service.callback(ctx, req, _),
    authentication_service.callback_redirect(req, _),
  )
  |> try_playlist_routes(ctx)
  |> try_non_api_routes(index_response)
  |> glitr_wisp.unwrap
}

fn try_playlist_routes(
  router: Result(glitr_wisp.Router, wisp.Response),
  ctx: web.Context,
) -> Result(glitr_wisp.Router, wisp.Response) {
  router
  |> glitr_wisp.try_service_route(
    playlist_routes.get_all(),
    playlist_service.get_all(ctx, _),
  )
  |> glitr_wisp.try_service_route(playlist_routes.get(), playlist_service.get(
    ctx,
    _,
  ))
  |> glitr_wisp.try_service_route(
    playlist_routes.create(),
    playlist_service.create(ctx, _),
  )
  |> glitr_wisp.try_service_route(
    playlist_routes.update(),
    playlist_service.update(ctx, _),
  )
  |> glitr_wisp.try_service_route(
    playlist_routes.delete(),
    playlist_service.delete(ctx, _),
  )
}

fn try_non_api_routes(
  router: Result(glitr_wisp.Router, wisp.Response),
  index_resp: wisp.Response,
) -> Result(glitr_wisp.Router, wisp.Response) {
  router
  |> glitr_wisp.try_map(
    route.new() |> route.with_path(path.static_path([])),
    fn(_) { Ok(Nil) },
    fn(_) { index_resp },
  )
  |> glitr_wisp.try_map(
    route.new()
      |> route.with_path(
        path.complex_path(
          path.PathConverter(fn(_) { [] }, fn(segs) {
            case segs {
              [first, ..] if first != "api" -> Ok(Nil)
              _ -> Error(Nil)
            }
          }),
        ),
      ),
    fn(_) { Ok(Nil) },
    fn(_) { index_resp },
  )
}
