import client/components/songs/song_row
import client/types/msg
import gleam/list
import lustre/attribute
import lustre/element
import lustre/element/html
import shared/types/song

pub fn view(results: List(song.Song)) -> element.Element(msg.Msg) {
  element.keyed(
    html.ul([attribute.class("rounded-lg overflow-clip mt-8 w-full")], _),
    {
      use song <- list.map(results)
      let child = html.li([], [song_row.view(song)])

      #(song.id, child)
    },
  )
}
