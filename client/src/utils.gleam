import client/types/msg
import glitr/lustre as gl
import lustre/effect
import plinth/browser/element

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
