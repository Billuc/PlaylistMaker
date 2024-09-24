import client/types/msg
import glitr/error
import glitr/route
import glitr_lustre
import lustre/effect
import plinth/browser/element
import plinth/javascript/console

pub fn send_and_handle_errors(
  req: glitr_lustre.RouteRequest(p, q, b, c),
  on_success: fn(c) -> msg.Msg,
) -> effect.Effect(msg.Msg) {
  req
  |> glitr_lustre.send(
    fn(res) {
      case res {
        Ok(ok) -> on_success(ok)
        Error(err) -> msg.ServerError(err)
      }
    },
    fn(msg) { effect.from(fn(dispatch) { dispatch(msg.ClientError(msg)) }) },
  )
}

pub fn unwrap_service_route(
  route: Result(route.Route(p, q, b, c), error.GlitrError),
  callback: fn(route.Route(p, q, b, c)) -> effect.Effect(msg.Msg),
) -> effect.Effect(msg.Msg) {
  case route {
    Error(err) -> effect.from(fn(_dispatch) { console.warn(err) })
    Ok(route) -> {
      callback(route)
    }
  }
}

@external(javascript, "./modal_dialog_ffi.mjs", "showModal")
pub fn show_modal(element: element.Element) -> Nil

@external(javascript, "./modal_dialog_ffi.mjs", "closeModal")
pub fn close_modal(element: element.Element) -> Nil
