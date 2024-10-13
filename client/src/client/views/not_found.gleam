import client/types/msg
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn view() -> List(Element(msg.Msg)) {
  [
    html.h3([attribute.class("text-lg my-20 text-center")], [
      html.text("The content you were looking for couldn't be found..."),
    ]),
  ]
}
