import client/components/playlists/create_playlist
import client/events/song_events
import client/types/msg
import gleam/dynamic
import gleam/list
import lustre/attribute
import lustre/element
import lustre/element/html
import lustre/event
import plinth/browser/document
import plinth/browser/element as br_el
import shared/types/playlist
import utils

pub fn view(
  playlists: List(#(String, playlist.Playlist)),
) -> List(element.Element(msg.Msg)) {
  [
    html.div([attribute.class("px-2 py-8 flex flex-col gap-2 items-stretch")], [
      html.a(
        [
          attribute.class("text-center font-bold text-3xl font-bold mb-2"),
          attribute.href("/"),
        ],
        [html.text("Playlist Maker")],
      ),
      html.form(
        [
          event.on("submit", on_submit),
          attribute.class(
            "rounded-md bg-zinc-800 hover:bg-zinc-700/50 opacity-50 hover:opacity-100 flex mb-4 items-center",
          ),
        ],
        [
          html.img([
            attribute.src("/search.svg"),
            attribute.class("w-4 h-4 mx-2"),
          ]),
          html.input([
            attribute.class(
              "py-2 px-4 bg-zinc-700/30 hover:bg-zinc-700/70 focus:bg-zinc-600/80 grow",
            ),
            attribute.id("search-songs-2"),
            attribute.placeholder("Search"),
          ]),
        ],
      ),
      element.keyed(
        html.div([attribute.class("flex flex-col items-stretch")], _),
        {
          use p <- list.map(playlists)
          let child = playlist_link(p.1)

          #(p.0, child)
        },
      ),
      html.button(
        [
          attribute.class(
            "text-center font-bold bg-zinc-800 hover:bg-zinc-700/50 rounded-md py-2 px-4",
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
      attribute.href("/playlists/" <> p.id),
    ],
    [html.text(p.name)],
  )
}

fn on_submit(ev: dynamic.Dynamic) -> Result(msg.Msg, List(dynamic.DecodeError)) {
  event.prevent_default(ev)

  let search = document.get_element_by_id("search-songs-2")
  use el <- utils.result_guard(
    search,
    Ok(msg.ClientError("Can't find an element with ID search-songs-2")),
  )
  use value <- utils.result_guard(
    el |> br_el.value(),
    Ok(msg.ClientError("Can't get value from search input")),
  )
  Ok(msg.SongEvent(song_events.SearchSongs(value)))
}
