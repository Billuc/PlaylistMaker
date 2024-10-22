import gleam/option

pub fn result_guard(result: Result(a, b), return: c, otherwise: fn(a) -> c) -> c {
  case result {
    Ok(value) -> otherwise(value)
    Error(_) -> return
  }
}

pub fn option_guard(
  value: option.Option(a),
  return: b,
  otherwise: fn(a) -> b,
) -> b {
  case value {
    option.None -> return
    option.Some(val) -> otherwise(val)
  }
}
