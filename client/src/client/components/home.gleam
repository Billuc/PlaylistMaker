import client/types/msg
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn home() -> List(Element(msg.Msg)) {
  [
    html.h3([attribute.class("text-lg mb-4 text-center")], [
      html.text(
        "Search songs and create playlists that can be exported to Spotify, Youtube Music,...",
      ),
    ]),
    html.a(
      [
        attribute.href("/login"),
        attribute.class(
          "text-green-400 bg-zinc-700 hover:bg-zinc-600 rounded-md font-bold flex gap-2 py-2 px-4",
        ),
      ],
      [
        html.img([
          attribute.src(
            "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png",
          ),
          attribute.class("h-6"),
        ]),
        html.text("Login to Spotify"),
      ],
    ),
  ]
}
