import gleam/http
import glitr
import glitr/utils
import shared/types/song

pub fn search() -> glitr.Route(String, Nil, List(song.Song)) {
  glitr.Route(
    http.Get,
    http.Http,
    "localhost",
    2345,
    False,
    utils.id_path_converter(["songs", "search"]),
    utils.no_body_converter(),
    song.song_list_converter(),
  )
}
