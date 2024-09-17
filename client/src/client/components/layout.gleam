import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn layout(children: List(Element(msg))) -> Element(msg) {
  html.div(
    [attribute.class("bg-zinc-800 min-w-screen min-h-screen text-pink-100")],
    [
      html.div(
        [
          attribute.class(
            "w-11/12 md:w-3/4 lg:w-1/2 max-w-3xl mx-auto flex flex-col items-center py-8",
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
