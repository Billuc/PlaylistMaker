import client/events/playlist_events
import client/services/playlist_service
import client/types/model
import client/types/msg
import gleam/dict
import gleam/list
import gleam/option
import gleam/result
import gleam/uri
import lustre/effect
import modem
import plinth/browser/window

pub fn on_playlist_event(
  model: model.Model,
  event: playlist_events.PlaylistEvent,
) -> #(model.Model, effect.Effect(_)) {
  case event {
    playlist_events.CreatePlaylist(name) -> #(
      model,
      playlist_service.create(name),
    )
    playlist_events.UpdatePlaylist(id, name) -> #(
      model,
      playlist_service.update(id, name),
    )
    playlist_events.DeletePlaylist(id) -> #(model, playlist_service.delete(id))
    playlist_events.ServerSentPlaylists(playlists) -> #(
      model.Model(
        ..model,
        playlists: dict.from_list(playlists |> list.map(fn(p) { #(p.id, p) })),
      ),
      effect.none(),
    )
    playlist_events.ServerCreatedPlaylist(p) -> #(
      model.Model(..model, playlists: model.playlists |> dict.insert(p.id, p)),
      effect.from(fn(dispatch) { dispatch(msg.CloseDialog("create-playlist")) }),
    )
    playlist_events.ServerUpdatedPlaylist(p)
    | playlist_events.ServerSentPlaylist(p) -> #(
      model.Model(..model, playlists: model.playlists |> dict.insert(p.id, p)),
      uri.parse(window.location())
        |> result.map(modem.load)
        |> result.unwrap(effect.none()),
    )
    playlist_events.ServerDeletedPlaylist(id) -> #(
      model.Model(..model, playlists: model.playlists |> dict.drop([id])),
      modem.push("/", option.None, option.None),
    )
  }
}
