import client/types/msg
import lucide_lustre
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn view() -> List(Element(msg.Msg)) {
  [
    html.h3([attribute.class("text-xl font-semibold mb-4 text-center")], [
      lucide_lustre.audio_lines([attribute.class("mr-2 inline")]),
      html.text("Search songs and create playlists"),
    ]),
    html.p([attribute.class("mb-4 text-center")], [
      html.text(
        "Start by creating a playlist or searching songs by clicking on the corresponding buttons on the left",
      ),
    ]),
  ]
}
