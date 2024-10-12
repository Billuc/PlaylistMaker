import client/components/playlist_songs/song_row
import client/types/msg
import gleam/list
import lustre/attribute
import lustre/element
import lustre/element/html
import shared/types/playlist_song

pub fn view(
  results: List(playlist_song.PlaylistSong),
) -> element.Element(msg.Msg) {
  element.keyed(
    html.ul([attribute.class("rounded-lg overflow-clip mt-8 w-full")], _),
    {
      use song <- list.map(results)
      let child = html.li([], [song_row.view(song)])

      #(song.id, child)
    },
  )
}
