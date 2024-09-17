import lustre_http
import shared/types/song

pub type Msg {
  SearchSongs(search: String)
  ServerSentSongs(results: List(song.Song))
  ServerError(error: lustre_http.HttpError)
  ClientError(message: String)
  PlayPreview(preview_url: String)
}
