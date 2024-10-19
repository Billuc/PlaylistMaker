import client/events/playlist_events
import client/events/playlist_song_events
import client/events/song_events
import client/types/route
import lustre_http

pub type Msg {
  SongEvent(ev: song_events.SongEvent)
  PlaylistEvent(ev: playlist_events.PlaylistEvent)
  PlaylistSongEvent(ev: playlist_song_events.PlaylistSongEvent)
  //
  ServerError(error: lustre_http.HttpError)
  ClientError(message: String)
  OpenDialog(id: String)
  CloseDialog(id: String)
  OnRouteChange(route: route.Route)
}
