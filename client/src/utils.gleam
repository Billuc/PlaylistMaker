import client/types/msg
import gleam/option
import gleam/result
import glitr/lustre as gl
import lustre/effect
import plinth/browser/document
import plinth/browser/element
import plinth/browser/window

pub fn send_and_handle_errors(
  req: gl.RouteRequest(p, q, b, c),
  on_success: fn(c) -> msg.Msg,
) -> effect.Effect(msg.Msg) {
  req
  |> gl.send(
    fn(res) {
      case res {
        Ok(ok) -> on_success(ok)
        Error(err) -> msg.ServerError(err)
      }
    },
    fn(msg) { effect.from(fn(dispatch) { dispatch(msg.ClientError(msg)) }) },
  )
}

@external(javascript, "./modal_dialog_ffi.mjs", "showModal")
pub fn show_modal(element: element.Element) -> Nil

@external(javascript, "./modal_dialog_ffi.mjs", "closeModal")
pub fn close_modal(element: element.Element) -> Nil

pub fn show_modal_by_id(id: String) -> Nil {
  window.request_animation_frame(fn(_) {
    document.get_element_by_id(id)
    |> result.map(show_modal)
    |> result.unwrap(Nil)
  })
  Nil
}

pub fn close_modal_by_id(id: String) -> Nil {
  window.request_animation_frame(fn(_) {
    document.get_element_by_id(id)
    |> result.map(close_modal)
    |> result.unwrap(Nil)
  })
  Nil
}

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
