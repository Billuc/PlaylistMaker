import client/types/msg
import lustre/attribute
import lustre/element
import lustre/element/html

pub fn spinner() -> element.Element(msg.Msg) {
  html.div(
    [
      attribute.class(
        "mt-8 w-8 h-8 animate-spin rounded-full border-2 border-t-zinc-800 border-x-zinc-800/50 border-b-zinc-800/50",
      ),
    ],
    [],
  )
}
