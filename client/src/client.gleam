import client/components/home
import client/components/layout
import client/components/search
import client/services/song_service
import client/types/model.{type Model, Model}
import client/types/msg
import gleam/list
import gleam/option
import gleam/result
import gleam/uri
import lustre
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import plinth/browser/audio
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
    |> result.then(fn(q) { q |> list.key_find("token") })
    |> result.unwrap("")

  #(
    Model(token, "", False, []),
    effect.from(fn(_dispatch) { console.log(token) }),
  )
}

// ------------------ UPDATE ---------------------

fn update(model: Model, msg: msg.Msg) -> #(Model, Effect(msg.Msg)) {
  case msg {
    msg.SearchSongs(q) -> #(
      Model(..model, last_search: q, searching: True),
      song_service.search(q, model.token),
    )
    msg.ServerSentSongs(songs) -> #(
      Model(..model, searching: False, results: songs),
      effect.none(),
    )
    msg.PlayPreview(url) -> #(
      model,
      effect.from(fn(_dispatch) {
        audio.new(url) |> audio.play
        Nil
      }),
    )
    msg.ClientError(err) -> #(
      model,
      effect.from(fn(_dispatch) { console.error(err) }),
    )
    msg.ServerError(err) -> #(
      model,
      effect.from(fn(_dispatch) { console.error(err) }),
    )
  }
}

// ------------------------ VIEW -------------------------

fn view(model: Model) -> Element(msg.Msg) {
  let children = case model {
    Model(token, _, _, _) if token == "" -> home.home()
    Model(_, _, searching, songs) -> search.search(searching, songs)
  }

  layout.layout(children)
}
