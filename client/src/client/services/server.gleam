import client/types/msg
import gleam/http
import glitr/lustre as gl
import lustre/effect

pub fn request_factory() -> gl.RequestFactory {
  gl.create_factory()
  |> gl.with_scheme(http.Http)
  |> gl.with_host("localhost")
  |> gl.with_port(2345)
}

pub fn send_and_handle_errors(
  req: gl.RouteRequest(p, q, b, c),
  on_success: fn(c) -> msg.Msg,
) -> effect.Effect(msg.Msg) {
  req
  |> gl.send(
    fn(res) {
      case res {
        Ok(ok) -> on_success(ok)
        Error(err) -> msg.ServerError(err)
      }
    },
    fn(msg) { effect.from(fn(dispatch) { dispatch(msg.ClientError(msg)) }) },
  )
}
