import client/components/playlists/create_playlist
import client/types/msg
import gleam/list
import lustre/attribute
import lustre/element
import lustre/element/html
import lustre/event
import shared/types/playlist

pub fn view(
  playlists: List(#(String, playlist.Playlist)),
) -> List(element.Element(msg.Msg)) {
  [
    html.div([attribute.class("p-2 flex flex-col gap-2 items-stretch")], [
      element.keyed(
        html.ul([attribute.class("flex flex-col items-stretch")], _),
        {
          use p <- list.map(playlists)
          let child = html.li([], [playlist_link(p.1)])

          #(p.0, child)
        },
      ),
      html.button(
        [
          attribute.class(
            "text-center font-bold border border-zinc-100 bg-zinc-900 hover:bg-zinc-800/50 rounded-md py-2 px-4",
          ),
          event.on("click", fn(_) { Ok(msg.OpenDialog("create-playlist")) }),
        ],
        [html.text("+ Create playlist")],
      ),
    ]),
    create_playlist.view(),
  ]
}

fn playlist_link(p: playlist.Playlist) -> element.Element(msg.Msg) {
  html.a(
    [
      attribute.class(
        "text-center font-bold bg-zinc-800 hover:bg-zinc-700/50 rounded-md py-2 px-4",
      ),
      attribute.href("playlists/" <> p.id),
    ],
    [html.text(p.name)],
  )
}
