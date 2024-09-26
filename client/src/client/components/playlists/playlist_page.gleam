import client/components/playlists/update_playlist
import client/components/songs/song_list
import client/events/playlist_events
import client/types/msg
import lustre/attribute as attr
import lustre/element
import lustre/element/html
import lustre/event
import shared/types/playlist

pub fn view(p: playlist.Playlist) -> List(element.Element(msg.Msg)) {
  [
    html.h3([attr.class("text-lg mb-4 text-center")], [html.text(p.name)]),
    html.div([attr.class("flex gap-4 mb-4")], [edit_button(), delete_button(p)]),
    song_list.view(p.songs),
    update_playlist.view(p),
  ]
}

fn edit_button() -> element.Element(msg.Msg) {
  html.button(
    [
      attr.class("py-2 px-4 bg-cyan-600 hover:bg-cyan-500/50 rounded-md"),
      event.on_click(msg.OpenDialog("update-playlist")),
    ],
    [html.text("Edit")],
  )
}

fn delete_button(p: playlist.Playlist) -> element.Element(msg.Msg) {
  html.button(
    [
      attr.class("py-2 px-4 bg-red-600 hover:bg-red-500/50 rounded-md"),
      event.on_click(msg.PlaylistEvent(playlist_events.DeletePlaylist(p.id))),
    ],
    [html.text("Delete")],
  )
}
