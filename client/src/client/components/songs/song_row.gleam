import client/events/song_events
import client/types/msg
import gleam/option
import gleam/string
import lustre/attribute
import lustre/element
import lustre/element/html
import lustre/event
import shared/types/song

pub fn view(song: song.Song) -> element.Element(msg.Msg) {
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
      html.button(
        [
          attribute.class(
            "rounded-full w-6 h-6 font-bold flex justify-center items-center bg-zinc-800/50 hover:bg-zinc-800/80",
          ),
          event.on_click(msg.SongEvent(song_events.SelectSong(song))),
        ],
        [html.text("+")],
      ),
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
          event.on("click", fn(_) {
            Ok(msg.SongEvent(song_events.PlayPreview(url)))
          }),
        ]),
        html.div(
          [
            attribute.class(
              "absolute w-full h-full top-0 left-0 group-hover:opacity-100 bg-zinc-100/50 text-zinc-800 p-2 opacity-0 transition-opacity duration-300 pointer-events-none",
            ),
          ],
          [html.img([attribute.src("/play-circle.svg")])],
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
