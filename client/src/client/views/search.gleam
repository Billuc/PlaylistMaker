import client/components/songs/song_list
import client/components/spinner
import client/types/msg
import lustre/attribute
import lustre/element
import lustre/element/html
import shared/types/song

pub fn search(
  searching: Bool,
  results: List(song.Song),
) -> List(element.Element(msg.Msg)) {
  [
    html.p([attribute.class("text-xl font-black mb-4")], [
      html.text("Results :"),
    ]),
    case searching {
      True -> spinner.spinner()
      False -> song_list.view(results)
    },
  ]
}
