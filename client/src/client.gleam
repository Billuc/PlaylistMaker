import client/components/home
import client/components/layout
import client/components/playlist_bar
import client/components/search
import client/services/playlist_service
import client/services/song_service
import client/types/model.{type Model, Model}
import client/types/msg
import gleam/dict
import gleam/list
import gleam/option
import gleam/result
import gleam/uri
import lustre
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import plinth/browser/audio
import plinth/browser/document
import plinth/browser/window
import plinth/javascript/console
import utils

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

  #(Model(token, "", False, [], dict.new()), playlist_service.get_all())
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
    msg.ServerSentPlaylists(playlists) -> #(
      Model(
        ..model,
        playlists: dict.from_list(playlists |> list.map(fn(p) { #(p.id, p) })),
      ),
      effect.none(),
    )
    msg.PlayPreview(url) -> #(
      model,
      effect.from(fn(_dispatch) {
        audio.new(url) |> audio.play
        Nil
      }),
    )
    msg.OpenDialog(id) -> #(
      model,
      effect.from(fn(_) {
        document.get_element_by_id(id)
        |> result.map(utils.show_modal)
        |> result.unwrap(Nil)
      }),
    )
    msg.CreatePlaylist(name) -> #(model, playlist_service.create(name))
    msg.ServerCreatedPlaylist(p) -> #(
      Model(..model, playlists: model.playlists |> dict.insert(p.id, p)),
      effect.from(fn(dispatch) { dispatch(msg.CloseDialog("create-playlist")) }),
    )
    msg.ServerUpdatedPlaylist(p) | msg.ServerSentPlaylist(p) -> #(
      Model(..model, playlists: model.playlists |> dict.insert(p.id, p)),
      effect.none(),
    )
    msg.ServerDeletedPlaylist(id) -> #(
      Model(..model, playlists: model.playlists |> dict.drop([id])),
      effect.none(),
    )
    msg.CloseDialog(id) -> #(
      model,
      effect.from(fn(_) {
        document.get_element_by_id(id)
        |> result.map(utils.close_modal)
        |> result.unwrap(Nil)
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
    // _ -> #(model, effect.none())
  }
}

// ------------------------ VIEW -------------------------

fn view(model: Model) -> Element(msg.Msg) {
  let children = case model {
    Model(token, _, _, _, _) if token == "" -> home.home()
    Model(_, _, searching, songs, _) -> search.search(searching, songs)
  }

  let left_children = playlist_bar.view(model.playlists |> dict.to_list)

  layout.layout(children, left_children)
}
