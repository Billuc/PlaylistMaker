import client/types/route
import gleam/dict
import shared/types/playlist

pub type Model {
  Model(
    route: route.Route,
    token: String,
    playlists: dict.Dict(String, playlist.Playlist),
  )
}
