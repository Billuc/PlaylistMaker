import lustre/attribute.{type Attribute, attribute}
import lustre/element/svg

pub fn circle_x(attributes: List(Attribute(a))) {
  svg.svg(
    [
      attribute("stroke-linejoin", "round"),
      attribute("stroke-linecap", "round"),
      attribute("stroke-width", "2"),
      attribute("stroke", "currentColor"),
      attribute("fill", "none"),
      attribute("viewBox", "0 0 24 24"),
      attribute("height", "24"),
      attribute("width", "24"),
      ..attributes
    ],
    [
      svg.circle([
        attribute("r", "10"),
        attribute("cy", "12"),
        attribute("cx", "12"),
      ]),
      svg.path([attribute("d", "m15 9-6 6")]),
      svg.path([attribute("d", "m9 9 6 6")]),
    ],
  )
}

pub fn audio_lines(attributes: List(Attribute(a))) {
  svg.svg(
    [
      attribute("stroke-linejoin", "round"),
      attribute("stroke-linecap", "round"),
      attribute("stroke-width", "2"),
      attribute("stroke", "currentColor"),
      attribute("fill", "none"),
      attribute("viewBox", "0 0 24 24"),
      attribute("height", "24"),
      attribute("width", "24"),
      ..attributes
    ],
    [
      svg.path([attribute("d", "M2 10v3")]),
      svg.path([attribute("d", "M6 6v11")]),
      svg.path([attribute("d", "M10 3v18")]),
      svg.path([attribute("d", "M14 8v7")]),
      svg.path([attribute("d", "M18 5v13")]),
      svg.path([attribute("d", "M22 10v3")]),
    ],
  )
}

pub fn pencil(attributes: List(Attribute(a))) {
  svg.svg(
    [
      attribute("stroke-linejoin", "round"),
      attribute("stroke-linecap", "round"),
      attribute("stroke-width", "2"),
      attribute("stroke", "currentColor"),
      attribute("fill", "none"),
      attribute("viewBox", "0 0 24 24"),
      attribute("height", "24"),
      attribute("width", "24"),
      ..attributes
    ],
    [
      svg.path([
        attribute(
          "d",
          "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
        ),
      ]),
      svg.path([attribute("d", "m15 5 4 4")]),
    ],
  )
}

pub fn trash_2(attributes: List(Attribute(a))) {
  svg.svg(
    [
      attribute("stroke-linejoin", "round"),
      attribute("stroke-linecap", "round"),
      attribute("stroke-width", "2"),
      attribute("stroke", "currentColor"),
      attribute("fill", "none"),
      attribute("viewBox", "0 0 24 24"),
      attribute("height", "24"),
      attribute("width", "24"),
      ..attributes
    ],
    [
      svg.path([attribute("d", "M3 6h18")]),
      svg.path([attribute("d", "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6")]),
      svg.path([attribute("d", "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2")]),
      svg.line([
        attribute("y2", "17"),
        attribute("y1", "11"),
        attribute("x2", "10"),
        attribute("x1", "10"),
      ]),
      svg.line([
        attribute("y2", "17"),
        attribute("y1", "11"),
        attribute("x2", "14"),
        attribute("x1", "14"),
      ]),
    ],
  )
}

pub fn circle_plus(attributes: List(Attribute(a))) {
  svg.svg(
    [
      attribute("stroke-linejoin", "round"),
      attribute("stroke-linecap", "round"),
      attribute("stroke-width", "2"),
      attribute("stroke", "currentColor"),
      attribute("fill", "none"),
      attribute("viewBox", "0 0 24 24"),
      attribute("height", "24"),
      attribute("width", "24"),
      ..attributes
    ],
    [
      svg.circle([
        attribute("r", "10"),
        attribute("cy", "12"),
        attribute("cx", "12"),
      ]),
      svg.path([attribute("d", "M8 12h8")]),
      svg.path([attribute("d", "M12 8v8")]),
    ],
  )
}

pub fn circle_play(attributes: List(Attribute(a))) {
  svg.svg(
    [
      attribute("stroke-linejoin", "round"),
      attribute("stroke-linecap", "round"),
      attribute("stroke-width", "2"),
      attribute("stroke", "currentColor"),
      attribute("fill", "none"),
      attribute("viewBox", "0 0 24 24"),
      attribute("height", "24"),
      attribute("width", "24"),
      ..attributes
    ],
    [
      svg.circle([
        attribute("r", "10"),
        attribute("cy", "12"),
        attribute("cx", "12"),
      ]),
      svg.polygon([attribute("points", "10 8 16 12 10 16 10 8")]),
    ],
  )
}

pub fn search(attributes: List(Attribute(a))) {
  svg.svg(
    [
      attribute("stroke-linejoin", "round"),
      attribute("stroke-linecap", "round"),
      attribute("stroke-width", "2"),
      attribute("stroke", "currentColor"),
      attribute("fill", "none"),
      attribute("viewBox", "0 0 24 24"),
      attribute("height", "24"),
      attribute("width", "24"),
      ..attributes
    ],
    [
      svg.circle([
        attribute("r", "8"),
        attribute("cy", "11"),
        attribute("cx", "11"),
      ]),
      svg.path([attribute("d", "m21 21-4.3-4.3")]),
    ],
  )
}
