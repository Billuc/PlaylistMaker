import cake
import cake/dialect/postgres_dialect
import cake/param
import gleam/dynamic
import gleam/int
import gleam/list
import gleam/pgo
import gleam/result
import glitr_wisp/errors
import pprint

pub fn exec_read_query(
  read_query: cake.ReadQuery,
  connection: pgo.Connection,
  decoder: fn(dynamic.Dynamic) -> Result(a, List(dynamic.DecodeError)),
) -> Result(List(a), errors.AppError) {
  let query = read_query |> postgres_dialect.read_query_to_prepared_statement

  pprint.debug(query |> cake.get_sql)
  pprint.debug(query |> cake.get_params)

  pgo.execute(
    query |> cake.get_sql,
    connection,
    query |> cake.get_params |> list.map(map_param),
    decoder,
  )
  |> result.map(fn(res) { res.rows })
  |> result.map_error(fn(err) { errors.DBError(map_error(err)) })
}

pub fn exec_write_query(
  write_query: cake.WriteQuery(_),
  connection: pgo.Connection,
  decoder: fn(dynamic.Dynamic) -> Result(a, List(dynamic.DecodeError)),
) -> Result(List(a), errors.AppError) {
  let query = write_query |> postgres_dialect.write_query_to_prepared_statement

  pprint.debug(query |> cake.get_sql)
  pprint.debug(query |> cake.get_params)

  pgo.execute(
    query |> cake.get_sql,
    connection,
    query |> cake.get_params |> list.map(map_param),
    decoder,
  )
  |> result.map(fn(res) { res.rows })
  |> result.map_error(fn(err) { errors.DBError(map_error(err)) })
}

fn map_param(p: param.Param) -> pgo.Value {
  case p {
    param.BoolParam(v) -> pgo.bool(v)
    param.FloatParam(v) -> pgo.float(v)
    param.IntParam(v) -> pgo.int(v)
    param.StringParam(v) -> pgo.text(v)
    param.NullParam -> pgo.null()
  }
}

fn map_error(err: pgo.QueryError) -> String {
  case err {
    pgo.ConnectionUnavailable -> "Connection unavailable"
    pgo.ConstraintViolated(msg, constraint, _detail) ->
      msg <> " Constraint : " <> constraint
    pgo.PostgresqlError(code, name, message) ->
      "[" <> code <> "]" <> name <> " : " <> message
    pgo.UnexpectedArgumentCount(expected, got) ->
      "Expected "
      <> int.to_string(expected)
      <> " arguments, got "
      <> int.to_string(got)
    pgo.UnexpectedArgumentType(expected, got) ->
      "One argument didn't have the right type (expected: "
      <> expected
      <> ", got: "
      <> got
      <> ")"
    pgo.UnexpectedResultType(_) ->
      "Couldn't decode the results, check your query, your decoder or your data"
  }
}
