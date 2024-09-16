import client/types/model.{type Model, Model}
import client/types/msg
import gleam/list
import gleam/option
import gleam/result
import gleam/uri
import lustre
import lustre/attribute
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import plinth/browser/window
import plinth/javascript/console

// ------------------ MAIN -------------------

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

// ----------------- INIT --------------------

fn init(_) -> #(Model, Effect(msg.Msg)) {
  let token =
    uri.parse(window.location())
    |> result.then(fn(uri) { uri.parse_query(uri.query |> option.unwrap("")) })
    |> result.then(fn(q) { q |> list.key_find("q") })
    |> result.unwrap("")

  #(Model(token), effect.none())
}

// ------------------ UPDATE ---------------------

fn update(_model: Model, msg: msg.Msg) -> #(Model, Effect(msg.Msg)) {
  case msg {
    msg.ServerSentToken(token) -> #(
      Model(token),
      effect.from(fn(_dispatch) { console.log(token) }),
    )
  }
}

// ------------------------ VIEW -------------------------

fn view(model: Model) -> Element(msg.Msg) {
  html.div([], [
    html.div([], [html.text(model.token)]),
    html.a([attribute.href("/login")], [html.text("Login")]),
  ])
}
