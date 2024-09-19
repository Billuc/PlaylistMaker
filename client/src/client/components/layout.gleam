import client/types/msg
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn layout(
  children: List(Element(msg.Msg)),
  left_children: List(Element(msg.Msg)),
) -> Element(msg.Msg) {
  html.div(
    [
      attribute.class(
        "bg-zinc-800 min-w-screen min-h-screen text-pink-100 p-4 flex flex-nowrap items-stretch",
      ),
    ],
    [
      html.aside(
        [
          attribute.class(
            "w-1/8 md:w-1/6 lg:w-1/4 max-w-lg bg-zinc-900 rounded-lg",
          ),
        ],
        left_children,
      ),
      html.div(
        [
          attribute.class(
            "w-3/4 md:w-2/3 lg:w-1/2 max-w-3xl flex-1 flex flex-col items-center py-8",
          ),
        ],
        [
          html.h1([attribute.class("text-4xl font-bold mb-8")], [
            html.text("Playlist Maker"),
          ]),
          ..children
        ],
      ),
    ],
  )
}