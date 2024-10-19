import client/events/playlist_song_events
import client/services/playlist_song_service
import client/types/model
import gleam/dict
import gleam/list
import lustre/effect
import shared/types/playlist
import shared/types/playlist_song
import utils

pub fn on_playlist_song_event(
  model: model.Model,
  event: playlist_song_events.PlaylistSongEvent,
) -> #(model.Model, effect.Effect(_)) {
  case event {
    playlist_song_events.CreatePlaylistSong(data) -> #(
      model,
      playlist_song_service.create(data),
    )
    playlist_song_events.CreatePlaylistSongFromCurrentSong(playlist_id) -> #(
      model,
      {
        use song <- utils.option_guard(model.current_song, effect.none())

        playlist_song_service.create(playlist_song.UpsertPlaylistSong(
          playlist_id,
          song.id,
          song.title,
          song.artists,
          song.album,
          song.album_cover,
          song.source,
        ))
      },
    )
    playlist_song_events.DeletePlaylistSong(id) -> #(
      model,
      playlist_song_service.delete(id),
    )
    playlist_song_events.ServerCreatedPlaylistSong(song) -> #(
      model |> add_playlist_song(song),
      effect.from(fn(_) { utils.show_modal_by_id("create-playlist-song") }),
    )
    playlist_song_events.ServerDeletedPlaylistSong(id) -> #(
      model |> remove_playlist_song(id),
      effect.none(),
    )
  }
}

fn add_playlist_song(
  model: model.Model,
  song: playlist_song.PlaylistSong,
) -> model.Model {
  use to_update <- utils.result_guard(
    model.playlists |> dict.get(song.playlist_id),
    model,
  )
  let new_playlist =
    playlist.Playlist(..to_update, songs: [song, ..to_update.songs])
  let new_dict = model.playlists |> dict.insert(song.playlist_id, new_playlist)

  model.Model(..model, playlists: new_dict)
}

fn remove_playlist_song(model: model.Model, id: String) -> model.Model {
  let playlists =
    model.playlists
    |> dict.to_list
    |> list.map(fn(pl) {
      #(
        pl.0,
        playlist.Playlist(
          ..pl.1,
          songs: { pl.1 }.songs |> list.filter(fn(s) { s.id != id }),
        ),
      )
    })

  model.Model(..model, playlists: playlists |> dict.from_list)
}
