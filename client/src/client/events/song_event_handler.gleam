import client/events/song_events
import client/services/song_service
import client/types/model
import client/types/route
import lustre/effect
import plinth/browser/audio

pub fn on_song_event(
  model: model.Model,
  event: song_events.SongEvent,
) -> #(model.Model, effect.Effect(_)) {
  case event {
    song_events.SearchSongs(q) -> #(
      model.Model(..model, route: route.Search(True, [])),
      song_service.search(q, model.token),
    )
    song_events.ServerSentSongs(songs) -> #(
      model.Model(..model, route: route.Search(False, songs)),
      effect.none(),
    )
    song_events.PlayPreview(url) -> #(
      model,
      effect.from(fn(_dispatch) {
        audio.new(url) |> audio.play
        Nil
      }),
    )
  }
}
