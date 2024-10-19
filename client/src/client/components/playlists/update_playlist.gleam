import client/events/playlist_events
import client/types/msg
import gleam/dynamic
import lustre/attribute
import lustre/element/html
import lustre/event
import plinth/browser/document
import plinth/browser/element as browser_element
import shared/types/playlist

pub fn view(p: playlist.Playlist) {
  html.dialog(
    [
      attribute.id("update-playlist"),
      attribute.class("p-4 rounded-lg backdrop:bg-zinc-900 backdrop:opacity-80"),
    ],
    [
      html.h1([attribute.class("text-2xl font-bold mb-4")], [
        html.text("Update a playlist " <> p.name),
      ]),
      html.div([attribute.class("flex flex-col gap-4")], [
        html.label([attribute.class("flex gap-2 items-center")], [
          html.span([], [html.text("Playlist name")]),
          html.input([
            attribute.id("update-playlist-name"),
            attribute.placeholder("Playlist name..."),
            attribute.class("p-2 rounded-md bg-zinc-100 focus:bg-zinc-200"),
            attribute.value(p.name),
          ]),
        ]),
        html.div([attribute.class("flex justify-end")], [
          html.button(
            [
              attribute.class("p-2 bg-zinc-100"),
              event.on("click", fn(_) { Ok(msg.CloseDialog("update-playlist")) }),
            ],
            [html.text("Close")],
          ),
          html.button(
            [
              attribute.class("p-2 bg-green-500 text-zinc-100"),
              event.on("click", on_update(_, p.id)),
            ],
            [html.text("Save")],
          ),
        ]),
      ]),
    ],
  )
}

fn on_update(_ev: dynamic.Dynamic, id: String) {
  let element = document.get_element_by_id("update-playlist-name")

  case element {
    Error(_) ->
      Ok(msg.ClientError("Couldn't find element with id update-playlist-name"))
    Ok(el) -> {
      let value = el |> browser_element.value()

      case value {
        Error(_) -> Ok(msg.ClientError("Couldn't get value of element"))
        Ok(name) ->
          Ok(msg.PlaylistEvent(playlist_events.UpdatePlaylist(id, name)))
      }
    }
  }
}
