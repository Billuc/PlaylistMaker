import client/types/msg
import lustre/attribute as attr
import lustre/element
import lustre/element/html
import shared/types/playlist

pub fn view(p: playlist.Playlist) -> List(element.Element(msg.Msg)) {
  [
    html.h3([attr.class("text-lg mb-4 text-center")], [html.text(p.name)]),
    html.div([attr.class("flex gap-4")], [edit_button(p), delete_button(p)]),
  ]
}

fn edit_button(p: playlist.Playlist) -> element.Element(msg.Msg) {
  html.button(
    [attr.class("py-2 px-4 bg-cyan-600 hover:bg-cyan-500/50 rounded-md")],
    [html.text("Edit")],
  )
}

fn delete_button(p: playlist.Playlist) -> element.Element(msg.Msg) {
  html.button(
    [attr.class("py-2 px-4 bg-red-600 hover:bg-red-500/50 rounded-md")],
    [html.text("Delete")],
  )
}
