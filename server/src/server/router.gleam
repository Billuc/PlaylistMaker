import glitr_wisp
import server/services/song_service
import server/web
import shared/routes/song_routes
import wisp.{type Request, type Response}

pub fn handle_request(req: Request, ctx: web.Context) -> Response {
  use _req <- web.middleware(req)

  glitr_wisp.for(req)
  |> glitr_wisp.try(song_routes.search(), song_service.search(ctx, _))
  |> glitr_wisp.unwrap
}
