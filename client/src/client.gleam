import client/types/model.{type Model, Model}
import client/types/msg
import lustre
import lustre/attribute
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import plinth/javascript/console

// ------------------ MAIN -------------------

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

// ----------------- INIT --------------------

fn init(_) -> #(Model, Effect(msg.Msg)) {
  #(Model(""), effect.none())
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

fn view(_model: Model) -> Element(msg.Msg) {
  html.div([], [html.a([attribute.href("/login")], [html.text("Login")])])
}
