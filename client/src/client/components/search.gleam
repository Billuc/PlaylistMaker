import client/components/spinner
import client/types/msg
import decipher
import gleam/dynamic
import gleam/list
import gleam/option
import gleam/result
import gleam/string
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
    html.div([attribute.class("rounded-md overflow-clip flex items-stretch")], [
      html.input([
        attribute.class(
          "py-2 px-4 bg-zinc-700/30 hover:bg-zinc-700/70 focus:bg-zinc-600/80",
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
    ]),
    case searching {
      True -> spinner.spinner()
      False -> result_list(results)
    },
  ]
}

fn on_click(ev: dynamic.Dynamic) -> Result(msg.Msg, List(dynamic.DecodeError)) {
  ev
  |> decipher.at(["target", "previousElementSibling", "value"], dynamic.string)
  |> result.map(msg.SearchSongs)
}

fn result_list(results: List(song.Song)) -> element.Element(msg.Msg) {
  element.keyed(
    html.ul([attribute.class("rounded-lg overflow-clip mt-8 w-full")], _),
    {
      use song <- list.map(results)
      let child = html.li([], [song_row(song)])

      #(song.id, child)
    },
  )
}

fn song_row(song: song.Song) -> element.Element(msg.Msg) {
  html.div(
    [
      attribute.class(
        "flex items-center gap-4 py-4 px-8 bg-zinc-700/50 hover:bg-zinc-700/80",
      ),
    ],
    [
      album_cover(song),
      html.div([attribute.class("flex flex-col flex-1")], [
        html.span([attribute.class("font-semibold")], [html.text(song.title)]),
        html.span([attribute.class("text-sm text-zinc-100/70")], [
          html.text(song.artists |> string.join(" - ")),
        ]),
        html.span([attribute.class("text-sm text-zinc-100/70")], [
          html.text(song.album),
        ]),
      ]),
    ],
  )
}

fn album_cover(song: song.Song) -> element.Element(msg.Msg) {
  case song.preview_url {
    option.Some(url) ->
      html.div([attribute.class("group relative")], [
        html.img([
          attribute.src(song.album_cover),
          attribute.class("w-16 h-16 rounded-sm"),
          event.on("click", fn(_) { Ok(msg.PlayPreview(url)) }),
        ]),
        html.div(
          [
            attribute.class(
              "absolute w-full h-full top-0 left-0 group-hover:opacity-100 bg-zinc-100/50 p-2 opacity-0 transition-opacity duration-300",
            ),
          ],
          [
            html.img([
              attribute.src(
                "https://www.svgrepo.com/download/524827/play-circle.svg",
              ),
            ]),
          ],
        ),
      ])
    option.None ->
      html.div([], [
        html.img([
          attribute.src(song.album_cover),
          attribute.class("w-16 h-16 rounded-sm"),
        ]),
      ])
  }
}
