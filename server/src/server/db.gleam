import gleam/dynamic
import gleam/int
import gleam/option
import gleam/pgo
import gleam/result
import gleam/string_builder

pub type DbInfos {
  DbInfos(
    host: String,
    port: Int,
    user: String,
    password: option.Option(String),
    db_name: String,
  )
}

pub fn get_db(infos: DbInfos, f: fn(pgo.Connection) -> b) -> b {
  let url =
    string_builder.new()
    |> string_builder.append("postgres://")
    |> string_builder.append(infos.user)
    |> string_builder.append(case infos.password {
      option.None -> ""
      option.Some(passwd) -> ":" <> passwd
    })
    |> string_builder.append("@")
    |> string_builder.append(infos.host)
    |> string_builder.append(":" <> int.to_string(infos.port))
    |> string_builder.append("/" <> infos.db_name)
    |> string_builder.to_string

  let assert Ok(config) = pgo.url_config(url)
  let db = pgo.connect(config)

  let assert Ok(_) = create_playlists_table(db)
  let assert Ok(_) = create_playlist_songs_table(db)

  f(db)
}

fn create_playlists_table(db: pgo.Connection) {
  let sql =
    "CREATE TABLE IF NOT EXISTS playlists(
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL
  )"

  pgo.execute(sql, db, with: [], expecting: fn(res) {
    res
    |> dynamic.string()
    |> result.then(fn(s) {
      case s == "CREATE TABLE" {
        True -> Ok(s)
        False -> Error([dynamic.DecodeError("CREATE TABLE", s, [])])
      }
    })
  })
}

fn create_playlist_songs_table(db: pgo.Connection) {
  let sql =
    "CREATE TABLE IF NOT EXISTS playlist_songs(
  id VARCHAR(36) PRIMARY KEY,
  playlist_id VARCHAR(36) PRIMARY KEY,
  song_id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  artists VARCHAR(100) NOT NULL,
  album VARCHAR(50) NOT NULL,
  album_cover VARCHAR(100)
  )"

  pgo.execute(sql, db, with: [], expecting: fn(res) {
    res
    |> dynamic.string()
    |> result.then(fn(s) {
      case s == "CREATE TABLE" {
        True -> Ok(s)
        False -> Error([dynamic.DecodeError("CREATE TABLE", s, [])])
      }
    })
  })
}
