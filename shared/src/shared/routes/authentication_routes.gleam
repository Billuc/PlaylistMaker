import gleam/dynamic
import gleam/http
import gleam/json
import glitr
import glitr/utils

pub fn login() -> glitr.Route(Nil, Nil, Nil) {
  glitr.Route(
    http.Get,
    http.Http,
    "localhost",
    2345,
    False,
    utils.simple_path_converter(["login"]),
    utils.no_body_converter(),
    utils.no_body_converter(),
  )
}

pub fn callback() -> glitr.Route(Nil, Nil, String) {
  glitr.Route(
    http.Get,
    http.Http,
    "localhost",
    2345,
    False,
    utils.simple_path_converter(["callback"]),
    utils.no_body_converter(),
    glitr.JsonConverter(json.string, dynamic.string),
  )
}
