import client/components/layout
import client/components/navigation_bar
import client/events/playlist_event_handler
import client/events/playlist_song_event_handler
import client/events/song_event_handler
import client/services/playlist_service
import client/types/model.{type Model, Model}
import client/types/msg
import client/types/route
import client/views/home
import client/views/login
import client/views/not_found
import client/views/playlist_page
import client/views/search
import gleam/dict
import gleam/option
import gleam/result
import gleam/uri
import lustre
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import modem
import plinth/browser/document
import plinth/browser/window
import plinth/javascript/console
import router
import token
import utils

// ------------------ MAIN -------------------

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

// ----------------- INIT --------------------

fn init(_) -> #(Model, Effect(msg.Msg)) {
  let assert Ok(uri) = uri.parse(window.location())

  #(
    Model(uri |> router.map_route, token.get_token(), option.None, dict.new()),
    effect.batch([
      modem.init(fn(uri) { uri |> router.map_route |> msg.OnRouteChange }),
      playlist_service.get_all(),
    ]),
  )
}

// ------------------ UPDATE ---------------------

fn update(model: Model, msg: msg.Msg) -> #(Model, Effect(msg.Msg)) {
  case msg {
    msg.SongEvent(ev) -> song_event_handler.on_song_event(model, ev)
    msg.PlaylistEvent(ev) -> playlist_event_handler.on_playlist_event(model, ev)
    msg.PlaylistSongEvent(ev) ->
      playlist_song_event_handler.on_playlist_song_event(model, ev)
    //
    msg.OpenDialog(id) -> #(
      model,
      effect.from(fn(_) {
        document.get_element_by_id(id)
        |> result.map(utils.show_modal)
        |> result.unwrap(Nil)
      }),
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
    msg.OnRouteChange(route.Login) -> #(
      model,
      uri.parse("login")
        |> result.map(modem.load(_))
        |> result.unwrap(effect.none()),
    )
    msg.OnRouteChange(route) -> #(Model(..model, route:), effect.none())
    // msg -> #(model, effect.from(fn(_) { console.log(msg) }))
  }
}

// ------------------------ VIEW -------------------------

fn view(model: Model) -> Element(msg.Msg) {
  let children = case model.token, model.route {
    "", route.Home | "", route.Search(_, _) -> login.view()
    _, route.Home -> home.view()
    _, route.Search(searching, songs) ->
      search.search(searching, songs, model.playlists |> dict.values)
    _, route.Playlist(id) -> {
      model.playlists
      |> dict.get(id)
      |> result.map(playlist_page.view)
      |> result.unwrap(not_found.view())
    }
    _, _ -> not_found.view()
  }

  let left_children = navigation_bar.view(model.playlists |> dict.to_list)

  layout.layout(children, left_children)
}
