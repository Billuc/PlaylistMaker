import client/components/playlist_songs/create_playlist_song
import client/components/songs/song_list
import client/components/spinner
import client/types/msg
import lustre/attribute
import lustre/element
import lustre/element/html
import shared/types/playlist
import shared/types/song

pub fn search(
  searching: Bool,
  results: List(song.Song),
  playlists: List(playlist.Playlist),
) -> List(element.Element(msg.Msg)) {
  [
    html.p([attribute.class("text-xl font-black mb-4")], [
      html.text("Results :"),
    ]),
    case searching {
      True -> spinner.spinner()
      False -> song_list.view(results)
    },
    create_playlist_song.view(playlists),
  ]
}
