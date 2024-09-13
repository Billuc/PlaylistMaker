import glitr_wisp
import server/web
import wisp.{type Request, type Response}

pub fn handle_request(req: Request, ctx: web.Context) -> Response {
  use _req <- web.middleware(req)

  glitr_wisp.for(req)
  |> todo
  |> glitr_wisp.unwrap
}
