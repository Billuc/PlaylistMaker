import client/components/songs/song_list
import client/components/spinner
import client/events/song_events
import client/types/msg
import decipher
import gleam/dynamic
import gleam/result
import lustre/attribute
import lustre/element
import lustre/element/html
import lustre/event
import shared/types/song

pub fn search(
  searching: Bool,
  results: List(song.Song),
) -> List(element.Element(msg.Msg)) {
  [
    html.div(
      [
        attribute.class(
          "rounded-md overflow-clip flex items-stretch max-w-lg mx-auto",
        ),
      ],
      [
        html.input([
          attribute.class(
            "py-2 px-4 bg-zinc-700/30 hover:bg-zinc-700/70 focus:bg-zinc-600/80 grow",
          ),
          attribute.id("search-songs"),
        ]),
        html.button(
          [
            attribute.class("bg-zinc-700 hover:bg-zinc-600 py-2 px-4"),
            event.on("click", on_click),
          ],
          [html.text("Search")],
        ),
      ],
    ),
    html.p([], [html.text("Search songs from Spotify")]),
    case searching {
      True -> spinner.spinner()
      False -> song_list.view(results)
    },
  ]
}

fn on_click(ev: dynamic.Dynamic) -> Result(msg.Msg, List(dynamic.DecodeError)) {
  ev
  |> decipher.at(["target", "previousElementSibling", "value"], dynamic.string)
  |> result.map(fn(s) { msg.SongEvent(song_events.SearchSongs(s)) })
}
