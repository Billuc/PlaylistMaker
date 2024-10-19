import client/events/song_events
import client/services/factory
import client/types/msg
import glitr/lustre as gl
import lustre/effect
import shared/routes/song_routes

pub fn search(q: String, token: String) {
  factory.factory()
  |> gl.for_route(song_routes.search())
  |> gl.with_path(Nil)
  |> gl.with_query(song_routes.SearchQuery(q, token))
  |> gl.send(
    fn(res) {
      case res {
        Ok(songs) -> msg.SongEvent(song_events.ServerSentSongs(songs))
        Error(err) -> msg.ServerError(err)
      }
    },
    fn(msg) { effect.from(fn(dispatch) { dispatch(msg.ClientError(msg)) }) },
  )
}
