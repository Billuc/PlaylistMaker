import gleam/http
import glitr/lustre as gl

pub fn factory() -> gl.RequestFactory {
  gl.create_factory()
  |> gl.with_scheme(http.Http)
  |> gl.with_host("localhost")
  |> gl.with_port(2345)
}
