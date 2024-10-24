import client/events/playlist_events
import client/types/msg
import gleam/dynamic
import lustre/attribute
import lustre/element/html
import lustre/event
import plinth/browser/document
import plinth/browser/element as browser_element

pub fn view() {
  html.dialog(
    [
      attribute.id("create-playlist"),
      attribute.class("p-4 rounded-lg backdrop:bg-zinc-900 backdrop:opacity-80"),
    ],
    [
      html.h1([attribute.class("text-2xl font-bold mb-4")], [
        html.text("Create a new playlist"),
      ]),
      html.div([attribute.class("flex flex-col gap-4")], [
        html.label([attribute.class("flex gap-2 items-center")], [
          html.span([], [html.text("Playlist name")]),
          html.input([
            attribute.id("create-playlist-name"),
            attribute.placeholder("Playlist name..."),
            attribute.class("p-2 rounded-md bg-zinc-100 focus:bg-zinc-200"),
          ]),
        ]),
        html.div([attribute.class("flex justify-end")], [
          html.button(
            [
              attribute.class("p-2 bg-zinc-100"),
              event.on("click", fn(_) { Ok(msg.CloseDialog("create-playlist")) }),
            ],
            [html.text("Close")],
          ),
          html.button(
            [
              attribute.class("p-2 bg-green-500 text-zinc-100"),
              event.on("click", on_create),
            ],
            [html.text("Create")],
          ),
        ]),
      ]),
    ],
  )
}

fn on_create(_ev: dynamic.Dynamic) {
  let element = document.get_element_by_id("create-playlist-name")

  case element {
    Error(_) ->
      Ok(msg.ClientError("Couldn't find element with id create-playlist-name"))
    Ok(el) -> {
      let value = el |> browser_element.value()

      case value {
        Error(_) -> Ok(msg.ClientError("Couldn't get value of element"))
        Ok(name) -> Ok(msg.PlaylistEvent(playlist_events.CreatePlaylist(name)))
      }
    }
  }
}
