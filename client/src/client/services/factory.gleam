import gleam/http
import glitr_lustre

pub fn factory() -> glitr_lustre.RequestFactory {
  glitr_lustre.create_factory()
  |> glitr_lustre.with_scheme(http.Http)
  |> glitr_lustre.with_host("localhost")
  |> glitr_lustre.with_port(2345)
}
