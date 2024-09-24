import client/services/factory
import client/types/msg
import glitr_lustre
import lustre/effect
import shared/routes/song_routes

pub fn search(q: String, token: String) {
  factory.factory()
  |> glitr_lustre.for_route(song_routes.search())
  |> glitr_lustre.with_path(Nil)
  |> glitr_lustre.with_query(song_routes.SearchQuery(q, token))
  |> glitr_lustre.send(
    fn(res) {
      case res {
        Ok(songs) -> msg.ServerSentSongs(songs)
        Error(err) -> msg.ServerError(err)
      }
    },
    fn(msg) { effect.from(fn(dispatch) { dispatch(msg.ClientError(msg)) }) },
  )
}
