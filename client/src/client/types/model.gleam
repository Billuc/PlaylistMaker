import shared/types/song

pub type Model {
  Model(
    token: String,
    last_search: String,
    searching: Bool,
    results: List(song.Song),
  )
}
