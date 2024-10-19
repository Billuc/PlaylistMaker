import client/types/route
import gleam/dict
import gleam/option
import shared/types/playlist
import shared/types/song

pub type Model {
  Model(
    route: route.Route,
    token: String,
    current_song: option.Option(song.Song),
    playlists: dict.Dict(String, playlist.Playlist),
  )
}
