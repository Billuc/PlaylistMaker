import client/types/msg
import gleam/string
import lustre/attribute
import lustre/element
import lustre/element/html
import shared/types/playlist_song

pub fn view(song: playlist_song.PlaylistSong) -> element.Element(msg.Msg) {
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

fn album_cover(song: playlist_song.PlaylistSong) -> element.Element(msg.Msg) {
  html.div([], [
    html.img([
      attribute.src(song.album_cover),
      attribute.class("w-16 h-16 rounded-sm"),
    ]),
  ])
}
