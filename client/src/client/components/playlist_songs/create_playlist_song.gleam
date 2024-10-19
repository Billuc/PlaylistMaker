import client/events/playlist_song_events
import client/types/msg
import gleam/dynamic
import gleam/javascript/array
import gleam/list
import lustre/attribute
import lustre/element
import lustre/element/html
import lustre/event
import plinth/browser/document
import plinth/browser/element as br_el
import shared/types/playlist
import utils

pub fn view(playlists: List(playlist.Playlist)) -> element.Element(msg.Msg) {
  html.dialog(
    [
      attribute.id("create-playlist-song"),
      attribute.class("p-4 rounded-lg backdrop:bg-zinc-900 backdrop:opacity-80"),
    ],
    [
      html.h1([attribute.class("text-2xl font-bold mb-4")], [
        html.text("Add this song to a playlist"),
      ]),
      html.div([attribute.class("flex flex-col gap-4")], [
        element.keyed(html.div([attribute.class("flex flex-col gap-2")], _), {
          use playlist <- list.map(playlists)
          #(playlist.id, playlist_radio(playlist))
        }),
        html.div([attribute.class("flex justify-end")], [
          html.button(
            [
              attribute.class("p-2 bg-zinc-100"),
              event.on("click", fn(_) {
                Ok(msg.CloseDialog("create-playlist-song"))
              }),
            ],
            [html.text("Close")],
          ),
          html.button(
            [
              attribute.class("p-2 bg-green-500 text-zinc-100"),
              event.on("click", on_add()),
            ],
            [html.text("Add")],
          ),
        ]),
      ]),
    ],
  )
}

fn playlist_radio(playlist: playlist.Playlist) {
  html.label([attribute.class("flex gap-2 items-center")], [
    html.input([
      attribute.type_("radio"),
      attribute.name("playlist"),
      attribute.value(playlist.id),
    ]),
    html.span([], [html.text(playlist.name)]),
  ])
}

fn on_add() -> fn(dynamic.Dynamic) -> Result(msg.Msg, List(dynamic.DecodeError)) {
  fn(_) {
    let playlist_radios =
      document.query_selector_all("input[name=\"playlist\"]")
    use element <- utils.result_guard(
      playlist_radios |> array.to_list |> list.find(br_el.get_checked),
      Ok(msg.ClientError("Couldn't find the selected playlist")),
    )
    use value <- utils.result_guard(
      element |> br_el.value(),
      Ok(msg.ClientError("Couldn't get the value of the selected playlist")),
    )
    Ok(
      msg.PlaylistSongEvent(
        playlist_song_events.CreatePlaylistSongFromCurrentSong(value),
      ),
    )
  }
}
