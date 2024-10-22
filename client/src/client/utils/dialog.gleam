import gleam/result
import plinth/browser/document
import plinth/browser/element
import plinth/browser/window

@external(javascript, "../../modal_dialog_ffi.mjs", "showModal")
pub fn show_modal(element: element.Element) -> Nil

@external(javascript, "../../modal_dialog_ffi.mjs", "closeModal")
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
