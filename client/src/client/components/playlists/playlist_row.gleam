import client/types/msg
import lustre/element
import lustre/element/html
import shared/types/playlist

pub fn view(playlist: playlist.Playlist) -> element.Element(msg.Msg) {
  html.li([], [html.div([], [html.text(playlist.name)])])
}
