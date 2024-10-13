// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label2) => label2 in fields ? fields[label2] : this[label2]
    );
    return new this.constructor(...properties);
  }
};
var List = class {
  static fromArray(array3, tail) {
    let t = tail || new Empty();
    for (let i = array3.length - 1; i >= 0; --i) {
      t = new NonEmpty(array3[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  // @internal
  atLeastLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return true;
      desired--;
    }
    return desired <= 0;
  }
  // @internal
  hasLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return false;
      desired--;
    }
    return desired === 0;
  }
  // @internal
  countLength() {
    let length5 = 0;
    for (let _ of this)
      length5++;
    return length5;
  }
};
function prepend(element2, tail) {
  return new NonEmpty(element2, tail);
}
function toList(elements2, tail) {
  return List.fromArray(elements2, tail);
}
var ListIterator = class {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
};
var Empty = class extends List {
};
var NonEmpty = class extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
};
var BitArray = class _BitArray {
  constructor(buffer) {
    if (!(buffer instanceof Uint8Array)) {
      throw "BitArray can only be constructed from a Uint8Array";
    }
    this.buffer = buffer;
  }
  // @internal
  get length() {
    return this.buffer.length;
  }
  // @internal
  byteAt(index3) {
    return this.buffer[index3];
  }
  // @internal
  floatFromSlice(start3, end, isBigEndian) {
    return byteArrayToFloat(this.buffer, start3, end, isBigEndian);
  }
  // @internal
  intFromSlice(start3, end, isBigEndian, isSigned) {
    return byteArrayToInt(this.buffer, start3, end, isBigEndian, isSigned);
  }
  // @internal
  binaryFromSlice(start3, end) {
    return new _BitArray(this.buffer.slice(start3, end));
  }
  // @internal
  sliceAfter(index3) {
    return new _BitArray(this.buffer.slice(index3));
  }
};
function byteArrayToInt(byteArray, start3, end, isBigEndian, isSigned) {
  let value3 = 0;
  if (isBigEndian) {
    for (let i = start3; i < end; i++) {
      value3 = value3 * 256 + byteArray[i];
    }
  } else {
    for (let i = end - 1; i >= start3; i--) {
      value3 = value3 * 256 + byteArray[i];
    }
  }
  if (isSigned) {
    const byteSize = end - start3;
    const highBit = 2 ** (byteSize * 8 - 1);
    if (value3 >= highBit) {
      value3 -= highBit * 2;
    }
  }
  return value3;
}
function byteArrayToFloat(byteArray, start3, end, isBigEndian) {
  const view13 = new DataView(byteArray.buffer);
  const byteSize = end - start3;
  if (byteSize === 8) {
    return view13.getFloat64(start3, !isBigEndian);
  } else if (byteSize === 4) {
    return view13.getFloat32(start3, !isBigEndian);
  } else {
    const msg = `Sized floats must be 32-bit or 64-bit on JavaScript, got size of ${byteSize * 8} bits`;
    throw new globalThis.Error(msg);
  }
}
var Result = class _Result extends CustomType {
  // @internal
  static isResult(data) {
    return data instanceof _Result;
  }
};
var Ok = class extends Result {
  constructor(value3) {
    super();
    this[0] = value3;
  }
  // @internal
  isOk() {
    return true;
  }
};
var Error = class extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  // @internal
  isOk() {
    return false;
  }
};
function isEqual(x, y) {
  let values = [x, y];
  while (values.length) {
    let a2 = values.pop();
    let b = values.pop();
    if (a2 === b)
      continue;
    if (!isObject(a2) || !isObject(b))
      return false;
    let unequal = !structurallyCompatibleObjects(a2, b) || unequalDates(a2, b) || unequalBuffers(a2, b) || unequalArrays(a2, b) || unequalMaps(a2, b) || unequalSets(a2, b) || unequalRegExps(a2, b);
    if (unequal)
      return false;
    const proto = Object.getPrototypeOf(a2);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a2.equals(b))
          continue;
        else
          return false;
      } catch {
      }
    }
    let [keys2, get3] = getters(a2);
    for (let k of keys2(a2)) {
      values.push(get3(a2, k), get3(b, k));
    }
  }
  return true;
}
function getters(object4) {
  if (object4 instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object4 instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a2, b) {
  return a2 instanceof Date && (a2 > b || a2 < b);
}
function unequalBuffers(a2, b) {
  return a2.buffer instanceof ArrayBuffer && a2.BYTES_PER_ELEMENT && !(a2.byteLength === b.byteLength && a2.every((n, i) => n === b[i]));
}
function unequalArrays(a2, b) {
  return Array.isArray(a2) && a2.length !== b.length;
}
function unequalMaps(a2, b) {
  return a2 instanceof Map && a2.size !== b.size;
}
function unequalSets(a2, b) {
  return a2 instanceof Set && (a2.size != b.size || [...a2].some((e) => !b.has(e)));
}
function unequalRegExps(a2, b) {
  return a2 instanceof RegExp && (a2.source !== b.source || a2.flags !== b.flags);
}
function isObject(a2) {
  return typeof a2 === "object" && a2 !== null;
}
function structurallyCompatibleObjects(a2, b) {
  if (typeof a2 !== "object" && typeof b !== "object" && (!a2 || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a2 instanceof c))
    return false;
  return a2.constructor === b.constructor;
}
function makeError(variant, module, line, fn, message, extra) {
  let error2 = new globalThis.Error(message);
  error2.gleam_error = variant;
  error2.module = module;
  error2.line = line;
  error2.function = fn;
  error2.fn = fn;
  for (let k in extra)
    error2[k] = extra[k];
  return error2;
}

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
var Some = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var None = class extends CustomType {
};
function to_result(option, e) {
  if (option instanceof Some) {
    let a2 = option[0];
    return new Ok(a2);
  } else {
    return new Error(e);
  }
}
function from_result(result) {
  if (result.isOk()) {
    let a2 = result[0];
    return new Some(a2);
  } else {
    return new None();
  }
}
function unwrap(option, default$) {
  if (option instanceof Some) {
    let x = option[0];
    return x;
  } else {
    return default$;
  }
}
function map(option, fun) {
  if (option instanceof Some) {
    let x = option[0];
    return new Some(fun(x));
  } else {
    return new None();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/regex.mjs
var Match = class extends CustomType {
  constructor(content, submatches) {
    super();
    this.content = content;
    this.submatches = submatches;
  }
};
var CompileError = class extends CustomType {
  constructor(error2, byte_index) {
    super();
    this.error = error2;
    this.byte_index = byte_index;
  }
};
var Options = class extends CustomType {
  constructor(case_insensitive, multi_line) {
    super();
    this.case_insensitive = case_insensitive;
    this.multi_line = multi_line;
  }
};
function compile(pattern, options) {
  return compile_regex(pattern, options);
}
function scan(regex, string5) {
  return regex_scan(regex, string5);
}

// build/dev/javascript/gleam_stdlib/gleam/int.mjs
function parse(string5) {
  return parse_int(string5);
}
function to_string2(x) {
  return to_string(x);
}

// build/dev/javascript/gleam_stdlib/gleam/pair.mjs
function second(pair) {
  let a2 = pair[1];
  return a2;
}

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
function do_reverse(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining.hasLength(0)) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest$1 = remaining.tail;
      loop$remaining = rest$1;
      loop$accumulator = prepend(item, accumulator);
    }
  }
}
function reverse(xs) {
  return do_reverse(xs, toList([]));
}
function first(list3) {
  if (list3.hasLength(0)) {
    return new Error(void 0);
  } else {
    let x = list3.head;
    return new Ok(x);
  }
}
function do_map(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list3.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list3.head;
      let xs = list3.tail;
      loop$list = xs;
      loop$fun = fun;
      loop$acc = prepend(fun(x), acc);
    }
  }
}
function map2(list3, fun) {
  return do_map(list3, fun, toList([]));
}
function do_index_map(loop$list, loop$fun, loop$index, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let fun = loop$fun;
    let index3 = loop$index;
    let acc = loop$acc;
    if (list3.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list3.head;
      let xs = list3.tail;
      let acc$1 = prepend(fun(x, index3), acc);
      loop$list = xs;
      loop$fun = fun;
      loop$index = index3 + 1;
      loop$acc = acc$1;
    }
  }
}
function index_map(list3, fun) {
  return do_index_map(list3, fun, 0, toList([]));
}
function do_try_map(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list3.hasLength(0)) {
      return new Ok(reverse(acc));
    } else {
      let x = list3.head;
      let xs = list3.tail;
      let $ = fun(x);
      if ($.isOk()) {
        let y = $[0];
        loop$list = xs;
        loop$fun = fun;
        loop$acc = prepend(y, acc);
      } else {
        let error2 = $[0];
        return new Error(error2);
      }
    }
  }
}
function try_map(list3, fun) {
  return do_try_map(list3, fun, toList([]));
}
function drop(loop$list, loop$n) {
  while (true) {
    let list3 = loop$list;
    let n = loop$n;
    let $ = n <= 0;
    if ($) {
      return list3;
    } else {
      if (list3.hasLength(0)) {
        return toList([]);
      } else {
        let xs = list3.tail;
        loop$list = xs;
        loop$n = n - 1;
      }
    }
  }
}
function do_take(loop$list, loop$n, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let n = loop$n;
    let acc = loop$acc;
    let $ = n <= 0;
    if ($) {
      return reverse(acc);
    } else {
      if (list3.hasLength(0)) {
        return reverse(acc);
      } else {
        let x = list3.head;
        let xs = list3.tail;
        loop$list = xs;
        loop$n = n - 1;
        loop$acc = prepend(x, acc);
      }
    }
  }
}
function take(list3, n) {
  return do_take(list3, n, toList([]));
}
function do_append(loop$first, loop$second) {
  while (true) {
    let first3 = loop$first;
    let second2 = loop$second;
    if (first3.hasLength(0)) {
      return second2;
    } else {
      let item = first3.head;
      let rest$1 = first3.tail;
      loop$first = rest$1;
      loop$second = prepend(item, second2);
    }
  }
}
function append(first3, second2) {
  return do_append(reverse(first3), second2);
}
function fold(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list3 = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list3.hasLength(0)) {
      return initial;
    } else {
      let x = list3.head;
      let rest$1 = list3.tail;
      loop$list = rest$1;
      loop$initial = fun(initial, x);
      loop$fun = fun;
    }
  }
}
function do_index_fold(loop$over, loop$acc, loop$with, loop$index) {
  while (true) {
    let over = loop$over;
    let acc = loop$acc;
    let with$ = loop$with;
    let index3 = loop$index;
    if (over.hasLength(0)) {
      return acc;
    } else {
      let first$1 = over.head;
      let rest$1 = over.tail;
      loop$over = rest$1;
      loop$acc = with$(acc, first$1, index3);
      loop$with = with$;
      loop$index = index3 + 1;
    }
  }
}
function index_fold(over, initial, fun) {
  return do_index_fold(over, initial, fun, 0);
}
function find_map(loop$haystack, loop$fun) {
  while (true) {
    let haystack = loop$haystack;
    let fun = loop$fun;
    if (haystack.hasLength(0)) {
      return new Error(void 0);
    } else {
      let x = haystack.head;
      let rest$1 = haystack.tail;
      let $ = fun(x);
      if ($.isOk()) {
        let x$1 = $[0];
        return new Ok(x$1);
      } else {
        loop$haystack = rest$1;
        loop$fun = fun;
      }
    }
  }
}
function do_intersperse(loop$list, loop$separator, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let separator = loop$separator;
    let acc = loop$acc;
    if (list3.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list3.head;
      let rest$1 = list3.tail;
      loop$list = rest$1;
      loop$separator = separator;
      loop$acc = prepend(x, prepend(separator, acc));
    }
  }
}
function intersperse(list3, elem) {
  if (list3.hasLength(0)) {
    return list3;
  } else if (list3.hasLength(1)) {
    return list3;
  } else {
    let x = list3.head;
    let rest$1 = list3.tail;
    return do_intersperse(rest$1, elem, toList([x]));
  }
}
function do_repeat(loop$a, loop$times, loop$acc) {
  while (true) {
    let a2 = loop$a;
    let times = loop$times;
    let acc = loop$acc;
    let $ = times <= 0;
    if ($) {
      return acc;
    } else {
      loop$a = a2;
      loop$times = times - 1;
      loop$acc = prepend(a2, acc);
    }
  }
}
function repeat(a2, times) {
  return do_repeat(a2, times, toList([]));
}
function key_find(keyword_list, desired_key) {
  return find_map(
    keyword_list,
    (keyword) => {
      let key2 = keyword[0];
      let value3 = keyword[1];
      let $ = isEqual(key2, desired_key);
      if ($) {
        return new Ok(value3);
      } else {
        return new Error(void 0);
      }
    }
  );
}
function key_set(list3, key2, value3) {
  if (list3.hasLength(0)) {
    return toList([[key2, value3]]);
  } else if (list3.atLeastLength(1) && isEqual(list3.head[0], key2)) {
    let k = list3.head[0];
    let rest$1 = list3.tail;
    return prepend([key2, value3], rest$1);
  } else {
    let first$1 = list3.head;
    let rest$1 = list3.tail;
    return prepend(first$1, key_set(rest$1, key2, value3));
  }
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function map3(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(fun(x));
  } else {
    let e = result[0];
    return new Error(e);
  }
}
function map_error(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(x);
  } else {
    let error2 = result[0];
    return new Error(fun(error2));
  }
}
function try$(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return fun(x);
  } else {
    let e = result[0];
    return new Error(e);
  }
}
function then$(result, fun) {
  return try$(result, fun);
}
function unwrap2(result, default$) {
  if (result.isOk()) {
    let v = result[0];
    return v;
  } else {
    return default$;
  }
}
function nil_error(result) {
  return map_error(result, (_) => {
    return void 0;
  });
}
function replace_error(result, error2) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(x);
  } else {
    return new Error(error2);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/string_builder.mjs
function new$2() {
  return concat(toList([]));
}
function from_strings(strings) {
  return concat(strings);
}
function concat2(builders) {
  return concat(builders);
}
function from_string(string5) {
  return identity(string5);
}
function to_string3(builder) {
  return identity(builder);
}
function split2(iodata, pattern) {
  return split(iodata, pattern);
}

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function length2(string5) {
  return string_length(string5);
}
function lowercase2(string5) {
  return lowercase(string5);
}
function starts_with2(string5, prefix) {
  return starts_with(string5, prefix);
}
function concat3(strings) {
  let _pipe = strings;
  let _pipe$1 = from_strings(_pipe);
  return to_string3(_pipe$1);
}
function join2(strings, separator) {
  return join(strings, separator);
}
function pop_grapheme2(string5) {
  return pop_grapheme(string5);
}
function do_slice(string5, idx, len) {
  let _pipe = string5;
  let _pipe$1 = graphemes(_pipe);
  let _pipe$2 = drop(_pipe$1, idx);
  let _pipe$3 = take(_pipe$2, len);
  return concat3(_pipe$3);
}
function slice(string5, idx, len) {
  let $ = len < 0;
  if ($) {
    return "";
  } else {
    let $1 = idx < 0;
    if ($1) {
      let translated_idx = length2(string5) + idx;
      let $2 = translated_idx < 0;
      if ($2) {
        return "";
      } else {
        return do_slice(string5, translated_idx, len);
      }
    } else {
      return do_slice(string5, idx, len);
    }
  }
}
function drop_left(string5, num_graphemes) {
  let $ = num_graphemes < 0;
  if ($) {
    return string5;
  } else {
    return slice(string5, num_graphemes, length2(string5) - num_graphemes);
  }
}
function split3(x, substring) {
  if (substring === "") {
    return graphemes(x);
  } else {
    let _pipe = x;
    let _pipe$1 = from_string(_pipe);
    let _pipe$2 = split2(_pipe$1, substring);
    return map2(_pipe$2, to_string3);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/dynamic.mjs
var DecodeError = class extends CustomType {
  constructor(expected, found, path) {
    super();
    this.expected = expected;
    this.found = found;
    this.path = path;
  }
};
function dynamic(value3) {
  return new Ok(value3);
}
function classify(data) {
  return classify_dynamic(data);
}
function int(data) {
  return decode_int(data);
}
function float(data) {
  return decode_float(data);
}
function bool(data) {
  return decode_bool(data);
}
function shallow_list(value3) {
  return decode_list(value3);
}
function optional(decode5) {
  return (value3) => {
    return decode_option(value3, decode5);
  };
}
function any(decoders) {
  return (data) => {
    if (decoders.hasLength(0)) {
      return new Error(
        toList([new DecodeError("another type", classify(data), toList([]))])
      );
    } else {
      let decoder = decoders.head;
      let decoders$1 = decoders.tail;
      let $ = decoder(data);
      if ($.isOk()) {
        let decoded = $[0];
        return new Ok(decoded);
      } else {
        return any(decoders$1)(data);
      }
    }
  };
}
function push_path(error2, name) {
  let name$1 = identity(name);
  let decoder = any(
    toList([string2, (x) => {
      return map3(int(x), to_string2);
    }])
  );
  let name$2 = (() => {
    let $ = decoder(name$1);
    if ($.isOk()) {
      let name$22 = $[0];
      return name$22;
    } else {
      let _pipe = toList(["<", classify(name$1), ">"]);
      let _pipe$1 = from_strings(_pipe);
      return to_string3(_pipe$1);
    }
  })();
  return error2.withFields({ path: prepend(name$2, error2.path) });
}
function list(decoder_type) {
  return (dynamic2) => {
    return try$(
      shallow_list(dynamic2),
      (list3) => {
        let _pipe = list3;
        let _pipe$1 = try_map(_pipe, decoder_type);
        return map_errors(
          _pipe$1,
          (_capture) => {
            return push_path(_capture, "*");
          }
        );
      }
    );
  };
}
function map_errors(result, f) {
  return map_error(
    result,
    (_capture) => {
      return map2(_capture, f);
    }
  );
}
function string2(data) {
  return decode_string(data);
}
function field(name, inner_type) {
  return (value3) => {
    let missing_field_error = new DecodeError("field", "nothing", toList([]));
    return try$(
      decode_field(value3, name),
      (maybe_inner) => {
        let _pipe = maybe_inner;
        let _pipe$1 = to_result(_pipe, toList([missing_field_error]));
        let _pipe$2 = try$(_pipe$1, inner_type);
        return map_errors(
          _pipe$2,
          (_capture) => {
            return push_path(_capture, name);
          }
        );
      }
    );
  };
}

// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap();
var tempDataView = new DataView(new ArrayBuffer(8));
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== void 0) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a2, b) {
  return a2 ^ b + 2654435769 + (a2 << 6) + (a2 >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i = 0; i < len; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i >> 16 ^ i) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch {
    }
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0; i < o.length; i++) {
      h = Math.imul(31, h) + getHash(o[i]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys2 = Object.keys(o);
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null)
    return 1108378658;
  if (u === void 0)
    return 1108378659;
  if (u === true)
    return 1108378657;
  if (u === false)
    return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var ENTRY = 0;
var ARRAY_NODE = 1;
var INDEX_NODE = 2;
var COLLISION_NODE = 3;
var EMPTY = {
  type: INDEX_NODE,
  bitmap: 0,
  array: []
};
function mask(hash, shift) {
  return hash >>> shift & MASK;
}
function bitpos(hash, shift) {
  return 1 << mask(hash, shift);
}
function bitcount(x) {
  x -= x >> 1 & 1431655765;
  x = (x & 858993459) + (x >> 2 & 858993459);
  x = x + (x >> 4) & 252645135;
  x += x >> 8;
  x += x >> 16;
  return x & 127;
}
function index(bitmap, bit) {
  return bitcount(bitmap & bit - 1);
}
function cloneAndSet(arr, at, val) {
  const len = arr.length;
  const out = new Array(len);
  for (let i = 0; i < len; ++i) {
    out[i] = arr[i];
  }
  out[at] = val;
  return out;
}
function spliceIn(arr, at, val) {
  const len = arr.length;
  const out = new Array(len + 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  out[g++] = val;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function spliceOut(arr, at) {
  const len = arr.length;
  const out = new Array(len - 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  ++i;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function createNode(shift, key1, val1, key2hash, key2, val2) {
  const key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      type: COLLISION_NODE,
      hash: key1hash,
      array: [
        { type: ENTRY, k: key1, v: val1 },
        { type: ENTRY, k: key2, v: val2 }
      ]
    };
  }
  const addedLeaf = { val: false };
  return assoc(
    assocIndex(EMPTY, shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf
  );
}
function assoc(root, shift, hash, key2, val, addedLeaf) {
  switch (root.type) {
    case ARRAY_NODE:
      return assocArray(root, shift, hash, key2, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root, shift, hash, key2, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root, shift, hash, key2, val, addedLeaf);
  }
}
function assocArray(root, shift, hash, key2, val, addedLeaf) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size + 1,
      array: cloneAndSet(root.array, idx, { type: ENTRY, k: key2, v: val })
    };
  }
  if (node.type === ENTRY) {
    if (isEqual(key2, node.k)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: ARRAY_NODE,
        size: root.size,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key2,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, node.k, node.v, hash, key2, val)
      )
    };
  }
  const n = assoc(node, shift + SHIFT, hash, key2, val, addedLeaf);
  if (n === node) {
    return root;
  }
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n)
  };
}
function assocIndex(root, shift, hash, key2, val, addedLeaf) {
  const bit = bitpos(hash, shift);
  const idx = index(root.bitmap, bit);
  if ((root.bitmap & bit) !== 0) {
    const node = root.array[idx];
    if (node.type !== ENTRY) {
      const n = assoc(node, shift + SHIFT, hash, key2, val, addedLeaf);
      if (n === node) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n)
      };
    }
    const nodeKey = node.k;
    if (isEqual(key2, nodeKey)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key2,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, nodeKey, node.v, hash, key2, val)
      )
    };
  } else {
    const n = root.array.length;
    if (n >= MAX_INDEX_NODE) {
      const nodes = new Array(32);
      const jdx = mask(hash, shift);
      nodes[jdx] = assocIndex(EMPTY, shift + SHIFT, hash, key2, val, addedLeaf);
      let j = 0;
      let bitmap = root.bitmap;
      for (let i = 0; i < 32; i++) {
        if ((bitmap & 1) !== 0) {
          const node = root.array[j++];
          nodes[i] = node;
        }
        bitmap = bitmap >>> 1;
      }
      return {
        type: ARRAY_NODE,
        size: n + 1,
        array: nodes
      };
    } else {
      const newArray = spliceIn(root.array, idx, {
        type: ENTRY,
        k: key2,
        v: val
      });
      addedLeaf.val = true;
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap | bit,
        array: newArray
      };
    }
  }
}
function assocCollision(root, shift, hash, key2, val, addedLeaf) {
  if (hash === root.hash) {
    const idx = collisionIndexOf(root, key2);
    if (idx !== -1) {
      const entry = root.array[idx];
      if (entry.v === val) {
        return root;
      }
      return {
        type: COLLISION_NODE,
        hash,
        array: cloneAndSet(root.array, idx, { type: ENTRY, k: key2, v: val })
      };
    }
    const size = root.array.length;
    addedLeaf.val = true;
    return {
      type: COLLISION_NODE,
      hash,
      array: cloneAndSet(root.array, size, { type: ENTRY, k: key2, v: val })
    };
  }
  return assoc(
    {
      type: INDEX_NODE,
      bitmap: bitpos(root.hash, shift),
      array: [root]
    },
    shift,
    hash,
    key2,
    val,
    addedLeaf
  );
}
function collisionIndexOf(root, key2) {
  const size = root.array.length;
  for (let i = 0; i < size; i++) {
    if (isEqual(key2, root.array[i].k)) {
      return i;
    }
  }
  return -1;
}
function find(root, shift, hash, key2) {
  switch (root.type) {
    case ARRAY_NODE:
      return findArray(root, shift, hash, key2);
    case INDEX_NODE:
      return findIndex(root, shift, hash, key2);
    case COLLISION_NODE:
      return findCollision(root, key2);
  }
}
function findArray(root, shift, hash, key2) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    return void 0;
  }
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key2);
  }
  if (isEqual(key2, node.k)) {
    return node;
  }
  return void 0;
}
function findIndex(root, shift, hash, key2) {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return void 0;
  }
  const idx = index(root.bitmap, bit);
  const node = root.array[idx];
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key2);
  }
  if (isEqual(key2, node.k)) {
    return node;
  }
  return void 0;
}
function findCollision(root, key2) {
  const idx = collisionIndexOf(root, key2);
  if (idx < 0) {
    return void 0;
  }
  return root.array[idx];
}
function without(root, shift, hash, key2) {
  switch (root.type) {
    case ARRAY_NODE:
      return withoutArray(root, shift, hash, key2);
    case INDEX_NODE:
      return withoutIndex(root, shift, hash, key2);
    case COLLISION_NODE:
      return withoutCollision(root, key2);
  }
}
function withoutArray(root, shift, hash, key2) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    return root;
  }
  let n = void 0;
  if (node.type === ENTRY) {
    if (!isEqual(node.k, key2)) {
      return root;
    }
  } else {
    n = without(node, shift + SHIFT, hash, key2);
    if (n === node) {
      return root;
    }
  }
  if (n === void 0) {
    if (root.size <= MIN_ARRAY_NODE) {
      const arr = root.array;
      const out = new Array(root.size - 1);
      let i = 0;
      let j = 0;
      let bitmap = 0;
      while (i < idx) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      ++i;
      while (i < arr.length) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      return {
        type: INDEX_NODE,
        bitmap,
        array: out
      };
    }
    return {
      type: ARRAY_NODE,
      size: root.size - 1,
      array: cloneAndSet(root.array, idx, n)
    };
  }
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n)
  };
}
function withoutIndex(root, shift, hash, key2) {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return root;
  }
  const idx = index(root.bitmap, bit);
  const node = root.array[idx];
  if (node.type !== ENTRY) {
    const n = without(node, shift + SHIFT, hash, key2);
    if (n === node) {
      return root;
    }
    if (n !== void 0) {
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n)
      };
    }
    if (root.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx)
    };
  }
  if (isEqual(key2, node.k)) {
    if (root.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx)
    };
  }
  return root;
}
function withoutCollision(root, key2) {
  const idx = collisionIndexOf(root, key2);
  if (idx < 0) {
    return root;
  }
  if (root.array.length === 1) {
    return void 0;
  }
  return {
    type: COLLISION_NODE,
    hash: root.hash,
    array: spliceOut(root.array, idx)
  };
}
function forEach(root, fn) {
  if (root === void 0) {
    return;
  }
  const items = root.array;
  const size = items.length;
  for (let i = 0; i < size; i++) {
    const item = items[i];
    if (item === void 0) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}
var Dict = class _Dict {
  /**
   * @template V
   * @param {Record<string,V>} o
   * @returns {Dict<string,V>}
   */
  static fromObject(o) {
    const keys2 = Object.keys(o);
    let m = _Dict.new();
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      m = m.set(k, o[k]);
    }
    return m;
  }
  /**
   * @template K,V
   * @param {Map<K,V>} o
   * @returns {Dict<K,V>}
   */
  static fromMap(o) {
    let m = _Dict.new();
    o.forEach((v, k) => {
      m = m.set(k, v);
    });
    return m;
  }
  static new() {
    return new _Dict(void 0, 0);
  }
  /**
   * @param {undefined | Node<K,V>} root
   * @param {number} size
   */
  constructor(root, size) {
    this.root = root;
    this.size = size;
  }
  /**
   * @template NotFound
   * @param {K} key
   * @param {NotFound} notFound
   * @returns {NotFound | V}
   */
  get(key2, notFound) {
    if (this.root === void 0) {
      return notFound;
    }
    const found = find(this.root, 0, getHash(key2), key2);
    if (found === void 0) {
      return notFound;
    }
    return found.v;
  }
  /**
   * @param {K} key
   * @param {V} val
   * @returns {Dict<K,V>}
   */
  set(key2, val) {
    const addedLeaf = { val: false };
    const root = this.root === void 0 ? EMPTY : this.root;
    const newRoot = assoc(root, 0, getHash(key2), key2, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    return new _Dict(newRoot, addedLeaf.val ? this.size + 1 : this.size);
  }
  /**
   * @param {K} key
   * @returns {Dict<K,V>}
   */
  delete(key2) {
    if (this.root === void 0) {
      return this;
    }
    const newRoot = without(this.root, 0, getHash(key2), key2);
    if (newRoot === this.root) {
      return this;
    }
    if (newRoot === void 0) {
      return _Dict.new();
    }
    return new _Dict(newRoot, this.size - 1);
  }
  /**
   * @param {K} key
   * @returns {boolean}
   */
  has(key2) {
    if (this.root === void 0) {
      return false;
    }
    return find(this.root, 0, getHash(key2), key2) !== void 0;
  }
  /**
   * @returns {[K,V][]}
   */
  entries() {
    if (this.root === void 0) {
      return [];
    }
    const result = [];
    this.forEach((v, k) => result.push([k, v]));
    return result;
  }
  /**
   *
   * @param {(val:V,key:K)=>void} fn
   */
  forEach(fn) {
    forEach(this.root, fn);
  }
  hashCode() {
    let h = 0;
    this.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
    return h;
  }
  /**
   * @param {unknown} o
   * @returns {boolean}
   */
  equals(o) {
    if (!(o instanceof _Dict) || this.size !== o.size) {
      return false;
    }
    let equal = true;
    this.forEach((v, k) => {
      equal = equal && isEqual(o.get(k, !v), v);
    });
    return equal;
  }
};

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = void 0;
var NOT_FOUND = {};
function identity(x) {
  return x;
}
function parse_int(value3) {
  if (/^[-+]?(\d+)$/.test(value3)) {
    return new Ok(parseInt(value3));
  } else {
    return new Error(Nil);
  }
}
function to_string(term) {
  return term.toString();
}
function string_length(string5) {
  if (string5 === "") {
    return 0;
  }
  const iterator = graphemes_iterator(string5);
  if (iterator) {
    let i = 0;
    for (const _ of iterator) {
      i++;
    }
    return i;
  } else {
    return string5.match(/./gsu).length;
  }
}
function graphemes(string5) {
  const iterator = graphemes_iterator(string5);
  if (iterator) {
    return List.fromArray(Array.from(iterator).map((item) => item.segment));
  } else {
    return List.fromArray(string5.match(/./gsu));
  }
}
function graphemes_iterator(string5) {
  if (globalThis.Intl && Intl.Segmenter) {
    return new Intl.Segmenter().segment(string5)[Symbol.iterator]();
  }
}
function pop_grapheme(string5) {
  let first3;
  const iterator = graphemes_iterator(string5);
  if (iterator) {
    first3 = iterator.next().value?.segment;
  } else {
    first3 = string5.match(/./su)?.[0];
  }
  if (first3) {
    return new Ok([first3, string5.slice(first3.length)]);
  } else {
    return new Error(Nil);
  }
}
function lowercase(string5) {
  return string5.toLowerCase();
}
function split(xs, pattern) {
  return List.fromArray(xs.split(pattern));
}
function join(xs, separator) {
  const iterator = xs[Symbol.iterator]();
  let result = iterator.next().value || "";
  let current = iterator.next();
  while (!current.done) {
    result = result + separator + current.value;
    current = iterator.next();
  }
  return result;
}
function concat(xs) {
  let result = "";
  for (const x of xs) {
    result = result + x;
  }
  return result;
}
function starts_with(haystack, needle) {
  return haystack.startsWith(needle);
}
var unicode_whitespaces = [
  " ",
  // Space
  "	",
  // Horizontal tab
  "\n",
  // Line feed
  "\v",
  // Vertical tab
  "\f",
  // Form feed
  "\r",
  // Carriage return
  "\x85",
  // Next line
  "\u2028",
  // Line separator
  "\u2029"
  // Paragraph separator
].join("");
var left_trim_regex = new RegExp(`^([${unicode_whitespaces}]*)`, "g");
var right_trim_regex = new RegExp(`([${unicode_whitespaces}]*)$`, "g");
function compile_regex(pattern, options) {
  try {
    let flags = "gu";
    if (options.case_insensitive)
      flags += "i";
    if (options.multi_line)
      flags += "m";
    return new Ok(new RegExp(pattern, flags));
  } catch (error2) {
    const number = (error2.columnNumber || 0) | 0;
    return new Error(new CompileError(error2.message, number));
  }
}
function regex_scan(regex, string5) {
  const matches = Array.from(string5.matchAll(regex)).map((match) => {
    const content = match[0];
    const submatches = [];
    for (let n = match.length - 1; n > 0; n--) {
      if (match[n]) {
        submatches[n - 1] = new Some(match[n]);
        continue;
      }
      if (submatches.length > 0) {
        submatches[n - 1] = new None();
      }
    }
    return new Match(content, List.fromArray(submatches));
  });
  return List.fromArray(matches);
}
function new_map() {
  return Dict.new();
}
function map_to_list(map6) {
  return List.fromArray(map6.entries());
}
function map_remove(key2, map6) {
  return map6.delete(key2);
}
function map_get(map6, key2) {
  const value3 = map6.get(key2, NOT_FOUND);
  if (value3 === NOT_FOUND) {
    return new Error(Nil);
  }
  return new Ok(value3);
}
function map_insert(key2, value3, map6) {
  return map6.set(key2, value3);
}
function unsafe_percent_decode_query(string5) {
  return decodeURIComponent((string5 || "").replace("+", " "));
}
function percent_encode(string5) {
  return encodeURIComponent(string5).replace("%2B", "+");
}
function parse_query(query) {
  try {
    const pairs = [];
    for (const section of query.split("&")) {
      const [key2, value3] = section.split("=");
      if (!key2)
        continue;
      const decodedKey = unsafe_percent_decode_query(key2);
      const decodedValue = unsafe_percent_decode_query(value3);
      pairs.push([decodedKey, decodedValue]);
    }
    return new Ok(List.fromArray(pairs));
  } catch {
    return new Error(Nil);
  }
}
function classify_dynamic(data) {
  if (typeof data === "string") {
    return "String";
  } else if (typeof data === "boolean") {
    return "Bool";
  } else if (data instanceof Result) {
    return "Result";
  } else if (data instanceof List) {
    return "List";
  } else if (data instanceof BitArray) {
    return "BitArray";
  } else if (data instanceof Dict) {
    return "Dict";
  } else if (Number.isInteger(data)) {
    return "Int";
  } else if (Array.isArray(data)) {
    return `Tuple of ${data.length} elements`;
  } else if (typeof data === "number") {
    return "Float";
  } else if (data === null) {
    return "Null";
  } else if (data === void 0) {
    return "Nil";
  } else {
    const type = typeof data;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
function decoder_error(expected, got) {
  return decoder_error_no_classify(expected, classify_dynamic(got));
}
function decoder_error_no_classify(expected, got) {
  return new Error(
    List.fromArray([new DecodeError(expected, got, List.fromArray([]))])
  );
}
function decode_string(data) {
  return typeof data === "string" ? new Ok(data) : decoder_error("String", data);
}
function decode_int(data) {
  return Number.isInteger(data) ? new Ok(data) : decoder_error("Int", data);
}
function decode_float(data) {
  return typeof data === "number" ? new Ok(data) : decoder_error("Float", data);
}
function decode_bool(data) {
  return typeof data === "boolean" ? new Ok(data) : decoder_error("Bool", data);
}
function decode_list(data) {
  if (Array.isArray(data)) {
    return new Ok(List.fromArray(data));
  }
  return data instanceof List ? new Ok(data) : decoder_error("List", data);
}
function decode_option(data, decoder) {
  if (data === null || data === void 0 || data instanceof None)
    return new Ok(new None());
  if (data instanceof Some)
    data = data[0];
  const result = decoder(data);
  if (result.isOk()) {
    return new Ok(new Some(result[0]));
  } else {
    return result;
  }
}
function decode_field(value3, name) {
  const not_a_map_error = () => decoder_error("Dict", value3);
  if (value3 instanceof Dict || value3 instanceof WeakMap || value3 instanceof Map) {
    const entry = map_get(value3, name);
    return new Ok(entry.isOk() ? new Some(entry[0]) : new None());
  } else if (value3 === null) {
    return not_a_map_error();
  } else if (Object.getPrototypeOf(value3) == Object.prototype) {
    return try_get_field(value3, name, () => new Ok(new None()));
  } else {
    return try_get_field(value3, name, not_a_map_error);
  }
}
function try_get_field(value3, field3, or_else) {
  try {
    return field3 in value3 ? new Ok(new Some(value3[field3])) : or_else();
  } catch {
    return or_else();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/dict.mjs
function new$() {
  return new_map();
}
function get(from2, get3) {
  return map_get(from2, get3);
}
function insert(dict, key2, value3) {
  return map_insert(key2, value3, dict);
}
function fold_list_of_pair(loop$list, loop$initial) {
  while (true) {
    let list3 = loop$list;
    let initial = loop$initial;
    if (list3.hasLength(0)) {
      return initial;
    } else {
      let x = list3.head;
      let rest = list3.tail;
      loop$list = rest;
      loop$initial = insert(initial, x[0], x[1]);
    }
  }
}
function from_list(list3) {
  return fold_list_of_pair(list3, new$());
}
function reverse_and_concat(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining.hasLength(0)) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest = remaining.tail;
      loop$remaining = rest;
      loop$accumulator = prepend(item, accumulator);
    }
  }
}
function do_keys_acc(loop$list, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let acc = loop$acc;
    if (list3.hasLength(0)) {
      return reverse_and_concat(acc, toList([]));
    } else {
      let x = list3.head;
      let xs = list3.tail;
      loop$list = xs;
      loop$acc = prepend(x[0], acc);
    }
  }
}
function do_keys(dict) {
  let list_of_pairs = map_to_list(dict);
  return do_keys_acc(list_of_pairs, toList([]));
}
function keys(dict) {
  return do_keys(dict);
}
function delete$(dict, key2) {
  return map_remove(key2, dict);
}
function drop2(loop$dict, loop$disallowed_keys) {
  while (true) {
    let dict = loop$dict;
    let disallowed_keys = loop$disallowed_keys;
    if (disallowed_keys.hasLength(0)) {
      return dict;
    } else {
      let x = disallowed_keys.head;
      let xs = disallowed_keys.tail;
      loop$dict = delete$(dict, x);
      loop$disallowed_keys = xs;
    }
  }
}

// build/dev/javascript/gleam_stdlib/gleam/uri.mjs
var Uri = class extends CustomType {
  constructor(scheme, userinfo, host, port, path, query, fragment) {
    super();
    this.scheme = scheme;
    this.userinfo = userinfo;
    this.host = host;
    this.port = port;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
  }
};
function regex_submatches(pattern, string5) {
  let _pipe = pattern;
  let _pipe$1 = compile(_pipe, new Options(true, false));
  let _pipe$2 = nil_error(_pipe$1);
  let _pipe$3 = map3(
    _pipe$2,
    (_capture) => {
      return scan(_capture, string5);
    }
  );
  let _pipe$4 = try$(_pipe$3, first);
  let _pipe$5 = map3(_pipe$4, (m) => {
    return m.submatches;
  });
  return unwrap2(_pipe$5, toList([]));
}
function noneify_query(x) {
  if (x instanceof None) {
    return new None();
  } else {
    let x$1 = x[0];
    let $ = pop_grapheme2(x$1);
    if ($.isOk() && $[0][0] === "?") {
      let query = $[0][1];
      return new Some(query);
    } else {
      return new None();
    }
  }
}
function noneify_empty_string(x) {
  if (x instanceof Some && x[0] === "") {
    return new None();
  } else if (x instanceof None) {
    return new None();
  } else {
    return x;
  }
}
function extra_required(loop$list, loop$remaining) {
  while (true) {
    let list3 = loop$list;
    let remaining = loop$remaining;
    if (remaining === 0) {
      return 0;
    } else if (list3.hasLength(0)) {
      return remaining;
    } else {
      let xs = list3.tail;
      loop$list = xs;
      loop$remaining = remaining - 1;
    }
  }
}
function pad_list(list3, size) {
  let _pipe = list3;
  return append(
    _pipe,
    repeat(new None(), extra_required(list3, size))
  );
}
function split_authority(authority) {
  let $ = unwrap(authority, "");
  if ($ === "") {
    return [new None(), new None(), new None()];
  } else if ($ === "//") {
    return [new None(), new Some(""), new None()];
  } else {
    let authority$1 = $;
    let matches = (() => {
      let _pipe = "^(//)?((.*)@)?(\\[[a-zA-Z0-9:.]*\\]|[^:]*)(:(\\d*))?";
      let _pipe$1 = regex_submatches(_pipe, authority$1);
      return pad_list(_pipe$1, 6);
    })();
    if (matches.hasLength(6)) {
      let userinfo = matches.tail.tail.head;
      let host = matches.tail.tail.tail.head;
      let port = matches.tail.tail.tail.tail.tail.head;
      let userinfo$1 = noneify_empty_string(userinfo);
      let host$1 = noneify_empty_string(host);
      let port$1 = (() => {
        let _pipe = port;
        let _pipe$1 = unwrap(_pipe, "");
        let _pipe$2 = parse(_pipe$1);
        return from_result(_pipe$2);
      })();
      return [userinfo$1, host$1, port$1];
    } else {
      return [new None(), new None(), new None()];
    }
  }
}
function do_parse(uri_string) {
  let pattern = "^(([a-z][a-z0-9\\+\\-\\.]*):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#.*)?";
  let matches = (() => {
    let _pipe = pattern;
    let _pipe$1 = regex_submatches(_pipe, uri_string);
    return pad_list(_pipe$1, 8);
  })();
  let $ = (() => {
    if (matches.hasLength(8)) {
      let scheme2 = matches.tail.head;
      let authority_with_slashes = matches.tail.tail.head;
      let path2 = matches.tail.tail.tail.tail.head;
      let query_with_question_mark = matches.tail.tail.tail.tail.tail.head;
      let fragment2 = matches.tail.tail.tail.tail.tail.tail.tail.head;
      return [
        scheme2,
        authority_with_slashes,
        path2,
        query_with_question_mark,
        fragment2
      ];
    } else {
      return [new None(), new None(), new None(), new None(), new None()];
    }
  })();
  let scheme = $[0];
  let authority = $[1];
  let path = $[2];
  let query = $[3];
  let fragment = $[4];
  let scheme$1 = noneify_empty_string(scheme);
  let path$1 = unwrap(path, "");
  let query$1 = noneify_query(query);
  let $1 = split_authority(authority);
  let userinfo = $1[0];
  let host = $1[1];
  let port = $1[2];
  let fragment$1 = (() => {
    let _pipe = fragment;
    let _pipe$1 = to_result(_pipe, void 0);
    let _pipe$2 = try$(_pipe$1, pop_grapheme2);
    let _pipe$3 = map3(_pipe$2, second);
    return from_result(_pipe$3);
  })();
  let scheme$2 = (() => {
    let _pipe = scheme$1;
    let _pipe$1 = noneify_empty_string(_pipe);
    return map(_pipe$1, lowercase2);
  })();
  return new Ok(
    new Uri(scheme$2, userinfo, host, port, path$1, query$1, fragment$1)
  );
}
function parse2(uri_string) {
  return do_parse(uri_string);
}
function parse_query2(query) {
  return parse_query(query);
}
function percent_encode2(value3) {
  return percent_encode(value3);
}
function do_remove_dot_segments(loop$input, loop$accumulator) {
  while (true) {
    let input2 = loop$input;
    let accumulator = loop$accumulator;
    if (input2.hasLength(0)) {
      return reverse(accumulator);
    } else {
      let segment = input2.head;
      let rest = input2.tail;
      let accumulator$1 = (() => {
        if (segment === "") {
          let accumulator$12 = accumulator;
          return accumulator$12;
        } else if (segment === ".") {
          let accumulator$12 = accumulator;
          return accumulator$12;
        } else if (segment === ".." && accumulator.hasLength(0)) {
          return toList([]);
        } else if (segment === ".." && accumulator.atLeastLength(1)) {
          let accumulator$12 = accumulator.tail;
          return accumulator$12;
        } else {
          let segment$1 = segment;
          let accumulator$12 = accumulator;
          return prepend(segment$1, accumulator$12);
        }
      })();
      loop$input = rest;
      loop$accumulator = accumulator$1;
    }
  }
}
function remove_dot_segments(input2) {
  return do_remove_dot_segments(input2, toList([]));
}
function path_segments(path) {
  return remove_dot_segments(split3(path, "/"));
}
function to_string4(uri) {
  let parts = (() => {
    let $ = uri.fragment;
    if ($ instanceof Some) {
      let fragment = $[0];
      return toList(["#", fragment]);
    } else {
      return toList([]);
    }
  })();
  let parts$1 = (() => {
    let $ = uri.query;
    if ($ instanceof Some) {
      let query = $[0];
      return prepend("?", prepend(query, parts));
    } else {
      return parts;
    }
  })();
  let parts$2 = prepend(uri.path, parts$1);
  let parts$3 = (() => {
    let $ = uri.host;
    let $1 = starts_with2(uri.path, "/");
    if ($ instanceof Some && !$1 && $[0] !== "") {
      let host = $[0];
      return prepend("/", parts$2);
    } else {
      return parts$2;
    }
  })();
  let parts$4 = (() => {
    let $ = uri.host;
    let $1 = uri.port;
    if ($ instanceof Some && $1 instanceof Some) {
      let port = $1[0];
      return prepend(":", prepend(to_string2(port), parts$3));
    } else {
      return parts$3;
    }
  })();
  let parts$5 = (() => {
    let $ = uri.scheme;
    let $1 = uri.userinfo;
    let $2 = uri.host;
    if ($ instanceof Some && $1 instanceof Some && $2 instanceof Some) {
      let s = $[0];
      let u = $1[0];
      let h = $2[0];
      return prepend(
        s,
        prepend(
          "://",
          prepend(u, prepend("@", prepend(h, parts$4)))
        )
      );
    } else if ($ instanceof Some && $1 instanceof None && $2 instanceof Some) {
      let s = $[0];
      let h = $2[0];
      return prepend(s, prepend("://", prepend(h, parts$4)));
    } else if ($ instanceof Some && $1 instanceof Some && $2 instanceof None) {
      let s = $[0];
      return prepend(s, prepend(":", parts$4));
    } else if ($ instanceof Some && $1 instanceof None && $2 instanceof None) {
      let s = $[0];
      return prepend(s, prepend(":", parts$4));
    } else if ($ instanceof None && $1 instanceof None && $2 instanceof Some) {
      let h = $2[0];
      return prepend("//", prepend(h, parts$4));
    } else {
      return parts$4;
    }
  })();
  return concat3(parts$5);
}

// build/dev/javascript/gleam_stdlib/gleam/bool.mjs
function guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence;
  } else {
    return alternative();
  }
}

// build/dev/javascript/gleam_json/gleam_json_ffi.mjs
function json_to_string(json) {
  return JSON.stringify(json);
}
function object(entries) {
  return Object.fromEntries(entries);
}
function identity2(x) {
  return x;
}
function array(list3) {
  return list3.toArray();
}
function do_null() {
  return null;
}
function decode(string5) {
  try {
    const result = JSON.parse(string5);
    return new Ok(result);
  } catch (err) {
    return new Error(getJsonDecodeError(err, string5));
  }
}
function getJsonDecodeError(stdErr, json) {
  if (isUnexpectedEndOfInput(stdErr))
    return new UnexpectedEndOfInput();
  return toUnexpectedByteError(stdErr, json);
}
function isUnexpectedEndOfInput(err) {
  const unexpectedEndOfInputRegex = /((unexpected (end|eof))|(end of data)|(unterminated string)|(json( parse error|\.parse)\: expected '(\:|\}|\])'))/i;
  return unexpectedEndOfInputRegex.test(err.message);
}
function toUnexpectedByteError(err, json) {
  let converters = [
    v8UnexpectedByteError,
    oldV8UnexpectedByteError,
    jsCoreUnexpectedByteError,
    spidermonkeyUnexpectedByteError
  ];
  for (let converter of converters) {
    let result = converter(err, json);
    if (result)
      return result;
  }
  return new UnexpectedByte("", 0);
}
function v8UnexpectedByteError(err) {
  const regex = /unexpected token '(.)', ".+" is not valid JSON/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[1]);
  return new UnexpectedByte(byte, -1);
}
function oldV8UnexpectedByteError(err) {
  const regex = /unexpected token (.) in JSON at position (\d+)/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[1]);
  const position = Number(match[2]);
  return new UnexpectedByte(byte, position);
}
function spidermonkeyUnexpectedByteError(err, json) {
  const regex = /(unexpected character|expected .*) at line (\d+) column (\d+)/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const line = Number(match[2]);
  const column = Number(match[3]);
  const position = getPositionFromMultiline(line, column, json);
  const byte = toHex(json[position]);
  return new UnexpectedByte(byte, position);
}
function jsCoreUnexpectedByteError(err) {
  const regex = /unexpected (identifier|token) "(.)"/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[2]);
  return new UnexpectedByte(byte, 0);
}
function toHex(char) {
  return "0x" + char.charCodeAt(0).toString(16).toUpperCase();
}
function getPositionFromMultiline(line, column, string5) {
  if (line === 1)
    return column - 1;
  let currentLn = 1;
  let position = 0;
  string5.split("").find((char, idx) => {
    if (char === "\n")
      currentLn += 1;
    if (currentLn === line) {
      position = idx + column;
      return true;
    }
    return false;
  });
  return position;
}

// build/dev/javascript/gleam_json/gleam/json.mjs
var UnexpectedEndOfInput = class extends CustomType {
};
var UnexpectedByte = class extends CustomType {
  constructor(byte, position) {
    super();
    this.byte = byte;
    this.position = position;
  }
};
var UnexpectedFormat = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
function do_decode(json, decoder) {
  return then$(
    decode(json),
    (dynamic_value) => {
      let _pipe = decoder(dynamic_value);
      return map_error(
        _pipe,
        (var0) => {
          return new UnexpectedFormat(var0);
        }
      );
    }
  );
}
function decode2(json, decoder) {
  return do_decode(json, decoder);
}
function to_string_builder(json) {
  return json_to_string(json);
}
function string3(input2) {
  return identity2(input2);
}
function bool2(input2) {
  return identity2(input2);
}
function int2(input2) {
  return identity2(input2);
}
function float2(input2) {
  return identity2(input2);
}
function null$() {
  return do_null();
}
function nullable(input2, inner_type) {
  if (input2 instanceof Some) {
    let value3 = input2[0];
    return inner_type(value3);
  } else {
    return null$();
  }
}
function object2(entries) {
  return object(entries);
}
function preprocessed_array(from2) {
  return array(from2);
}
function array2(entries, inner_type) {
  let _pipe = entries;
  let _pipe$1 = map2(_pipe, inner_type);
  return preprocessed_array(_pipe$1);
}

// build/dev/javascript/lustre/lustre/effect.mjs
var Effect = class extends CustomType {
  constructor(all) {
    super();
    this.all = all;
  }
};
function custom(run) {
  return new Effect(
    toList([
      (actions) => {
        return run(actions.dispatch, actions.emit, actions.select);
      }
    ])
  );
}
function from(effect) {
  return custom((dispatch, _, _1) => {
    return effect(dispatch);
  });
}
function none() {
  return new Effect(toList([]));
}
function batch(effects) {
  return new Effect(
    fold(
      effects,
      toList([]),
      (b, _use1) => {
        let a2 = _use1.all;
        return append(b, a2);
      }
    )
  );
}

// build/dev/javascript/lustre/lustre/internals/vdom.mjs
var Text = class extends CustomType {
  constructor(content) {
    super();
    this.content = content;
  }
};
var Element2 = class extends CustomType {
  constructor(key2, namespace, tag, attrs, children2, self_closing, void$) {
    super();
    this.key = key2;
    this.namespace = namespace;
    this.tag = tag;
    this.attrs = attrs;
    this.children = children2;
    this.self_closing = self_closing;
    this.void = void$;
  }
};
var Map2 = class extends CustomType {
  constructor(subtree) {
    super();
    this.subtree = subtree;
  }
};
var Fragment = class extends CustomType {
  constructor(elements2, key2) {
    super();
    this.elements = elements2;
    this.key = key2;
  }
};
var Attribute = class extends CustomType {
  constructor(x0, x1, as_property) {
    super();
    this[0] = x0;
    this[1] = x1;
    this.as_property = as_property;
  }
};
var Event2 = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
function attribute_to_event_handler(attribute2) {
  if (attribute2 instanceof Attribute) {
    return new Error(void 0);
  } else {
    let name = attribute2[0];
    let handler = attribute2[1];
    let name$1 = drop_left(name, 2);
    return new Ok([name$1, handler]);
  }
}
function do_element_list_handlers(elements2, handlers2, key2) {
  return index_fold(
    elements2,
    handlers2,
    (handlers3, element2, index3) => {
      let key$1 = key2 + "-" + to_string2(index3);
      return do_handlers(element2, handlers3, key$1);
    }
  );
}
function do_handlers(loop$element, loop$handlers, loop$key) {
  while (true) {
    let element2 = loop$element;
    let handlers2 = loop$handlers;
    let key2 = loop$key;
    if (element2 instanceof Text) {
      return handlers2;
    } else if (element2 instanceof Map2) {
      let subtree = element2.subtree;
      loop$element = subtree();
      loop$handlers = handlers2;
      loop$key = key2;
    } else if (element2 instanceof Element2) {
      let attrs = element2.attrs;
      let children2 = element2.children;
      let handlers$1 = fold(
        attrs,
        handlers2,
        (handlers3, attr) => {
          let $ = attribute_to_event_handler(attr);
          if ($.isOk()) {
            let name = $[0][0];
            let handler = $[0][1];
            return insert(handlers3, key2 + "-" + name, handler);
          } else {
            return handlers3;
          }
        }
      );
      return do_element_list_handlers(children2, handlers$1, key2);
    } else {
      let elements2 = element2.elements;
      return do_element_list_handlers(elements2, handlers2, key2);
    }
  }
}
function handlers(element2) {
  return do_handlers(element2, new$(), "0");
}

// build/dev/javascript/lustre/lustre/attribute.mjs
function attribute(name, value3) {
  return new Attribute(name, identity(value3), false);
}
function on(name, handler) {
  return new Event2("on" + name, handler);
}
function class$(name) {
  return attribute("class", name);
}
function id(name) {
  return attribute("id", name);
}
function value(val) {
  return attribute("value", val);
}
function placeholder(text3) {
  return attribute("placeholder", text3);
}
function href(uri) {
  return attribute("href", uri);
}
function src(uri) {
  return attribute("src", uri);
}

// build/dev/javascript/lustre/lustre/element.mjs
function element(tag, attrs, children2) {
  if (tag === "area") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "base") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "br") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "col") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "embed") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "hr") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "img") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "input") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "link") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "meta") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "param") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "source") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "track") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "wbr") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else {
    return new Element2("", "", tag, attrs, children2, false, false);
  }
}
function do_keyed(el, key2) {
  if (el instanceof Element2) {
    let namespace = el.namespace;
    let tag = el.tag;
    let attrs = el.attrs;
    let children2 = el.children;
    let self_closing = el.self_closing;
    let void$ = el.void;
    return new Element2(
      key2,
      namespace,
      tag,
      attrs,
      children2,
      self_closing,
      void$
    );
  } else if (el instanceof Map2) {
    let subtree = el.subtree;
    return new Map2(() => {
      return do_keyed(subtree(), key2);
    });
  } else if (el instanceof Fragment) {
    let elements2 = el.elements;
    let _pipe = elements2;
    let _pipe$1 = index_map(
      _pipe,
      (element2, idx) => {
        if (element2 instanceof Element2) {
          let el_key = element2.key;
          let new_key = (() => {
            if (el_key === "") {
              return key2 + "-" + to_string2(idx);
            } else {
              return key2 + "-" + el_key;
            }
          })();
          return do_keyed(element2, new_key);
        } else {
          return do_keyed(element2, key2);
        }
      }
    );
    return new Fragment(_pipe$1, key2);
  } else {
    return el;
  }
}
function keyed(el, children2) {
  return el(
    map2(
      children2,
      (_use0) => {
        let key2 = _use0[0];
        let child = _use0[1];
        return do_keyed(child, key2);
      }
    )
  );
}
function text(content) {
  return new Text(content);
}

// build/dev/javascript/gleam_stdlib/gleam/set.mjs
var Set2 = class extends CustomType {
  constructor(dict) {
    super();
    this.dict = dict;
  }
};
function new$3() {
  return new Set2(new$());
}

// build/dev/javascript/lustre/lustre/internals/patch.mjs
var Diff = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Emit = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Init = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
function is_empty_element_diff(diff2) {
  return isEqual(diff2.created, new$()) && isEqual(
    diff2.removed,
    new$3()
  ) && isEqual(diff2.updated, new$());
}

// build/dev/javascript/lustre/lustre/internals/runtime.mjs
var Attrs = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Batch = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Debug = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Dispatch = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Emit2 = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Event3 = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Shutdown = class extends CustomType {
};
var Subscribe = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Unsubscribe = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var ForceModel = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};

// build/dev/javascript/lustre/vdom.ffi.mjs
function morph(prev, next, dispatch) {
  let out;
  let stack = [{ prev, next, parent: prev.parentNode }];
  while (stack.length) {
    let { prev: prev2, next: next2, parent } = stack.pop();
    while (next2.subtree !== void 0)
      next2 = next2.subtree();
    if (next2.content !== void 0) {
      if (!prev2) {
        const created = document.createTextNode(next2.content);
        parent.appendChild(created);
        out ??= created;
      } else if (prev2.nodeType === Node.TEXT_NODE) {
        if (prev2.textContent !== next2.content)
          prev2.textContent = next2.content;
        out ??= prev2;
      } else {
        const created = document.createTextNode(next2.content);
        parent.replaceChild(created, prev2);
        out ??= created;
      }
    } else if (next2.tag !== void 0) {
      const created = createElementNode({
        prev: prev2,
        next: next2,
        dispatch,
        stack
      });
      if (!prev2) {
        parent.appendChild(created);
      } else if (prev2 !== created) {
        parent.replaceChild(created, prev2);
      }
      out ??= created;
    } else if (next2.elements !== void 0) {
      for (const fragmentElement of forceChild(next2)) {
        stack.unshift({ prev: prev2, next: fragmentElement, parent });
        prev2 = prev2?.nextSibling;
      }
    }
  }
  return out;
}
function createElementNode({ prev, next, dispatch, stack }) {
  const namespace = next.namespace || "http://www.w3.org/1999/xhtml";
  const canMorph = prev && prev.nodeType === Node.ELEMENT_NODE && prev.localName === next.tag && prev.namespaceURI === (next.namespace || "http://www.w3.org/1999/xhtml");
  const el = canMorph ? prev : namespace ? document.createElementNS(namespace, next.tag) : document.createElement(next.tag);
  let handlersForEl;
  if (!registeredHandlers.has(el)) {
    const emptyHandlers = /* @__PURE__ */ new Map();
    registeredHandlers.set(el, emptyHandlers);
    handlersForEl = emptyHandlers;
  } else {
    handlersForEl = registeredHandlers.get(el);
  }
  const prevHandlers = canMorph ? new Set(handlersForEl.keys()) : null;
  const prevAttributes = canMorph ? new Set(Array.from(prev.attributes, (a2) => a2.name)) : null;
  let className = null;
  let style = null;
  let innerHTML = null;
  if (canMorph && next.tag === "textarea") {
    const innertText = next.children[Symbol.iterator]().next().value?.content;
    if (innertText !== void 0)
      el.value = innertText;
  }
  const delegated = [];
  for (const attr of next.attrs) {
    const name = attr[0];
    const value3 = attr[1];
    if (attr.as_property) {
      if (el[name] !== value3)
        el[name] = value3;
      if (canMorph)
        prevAttributes.delete(name);
    } else if (name.startsWith("on")) {
      const eventName = name.slice(2);
      const callback = dispatch(value3, eventName === "input");
      if (!handlersForEl.has(eventName)) {
        el.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      if (canMorph)
        prevHandlers.delete(eventName);
    } else if (name.startsWith("data-lustre-on-")) {
      const eventName = name.slice(15);
      const callback = dispatch(lustreServerEventHandler);
      if (!handlersForEl.has(eventName)) {
        el.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      el.setAttribute(name, value3);
    } else if (name.startsWith("delegate:data-") || name.startsWith("delegate:aria-")) {
      el.setAttribute(name, value3);
      delegated.push([name.slice(10), value3]);
    } else if (name === "class") {
      className = className === null ? value3 : className + " " + value3;
    } else if (name === "style") {
      style = style === null ? value3 : style + value3;
    } else if (name === "dangerous-unescaped-html") {
      innerHTML = value3;
    } else {
      if (el.getAttribute(name) !== value3)
        el.setAttribute(name, value3);
      if (name === "value" || name === "selected")
        el[name] = value3;
      if (canMorph)
        prevAttributes.delete(name);
    }
  }
  if (className !== null) {
    el.setAttribute("class", className);
    if (canMorph)
      prevAttributes.delete("class");
  }
  if (style !== null) {
    el.setAttribute("style", style);
    if (canMorph)
      prevAttributes.delete("style");
  }
  if (canMorph) {
    for (const attr of prevAttributes) {
      el.removeAttribute(attr);
    }
    for (const eventName of prevHandlers) {
      handlersForEl.delete(eventName);
      el.removeEventListener(eventName, lustreGenericEventHandler);
    }
  }
  if (next.tag === "slot") {
    window.queueMicrotask(() => {
      for (const child of el.assignedElements()) {
        for (const [name, value3] of delegated) {
          if (!child.hasAttribute(name)) {
            child.setAttribute(name, value3);
          }
        }
      }
    });
  }
  if (next.key !== void 0 && next.key !== "") {
    el.setAttribute("data-lustre-key", next.key);
  } else if (innerHTML !== null) {
    el.innerHTML = innerHTML;
    return el;
  }
  let prevChild = el.firstChild;
  let seenKeys = null;
  let keyedChildren = null;
  let incomingKeyedChildren = null;
  let firstChild = children(next).next().value;
  if (canMorph && firstChild !== void 0 && // Explicit checks are more verbose but truthy checks force a bunch of comparisons
  // we don't care about: it's never gonna be a number etc.
  firstChild.key !== void 0 && firstChild.key !== "") {
    seenKeys = /* @__PURE__ */ new Set();
    keyedChildren = getKeyedChildren(prev);
    incomingKeyedChildren = getKeyedChildren(next);
    for (const child of children(next)) {
      prevChild = diffKeyedChild(
        prevChild,
        child,
        el,
        stack,
        incomingKeyedChildren,
        keyedChildren,
        seenKeys
      );
    }
  } else {
    for (const child of children(next)) {
      stack.unshift({ prev: prevChild, next: child, parent: el });
      prevChild = prevChild?.nextSibling;
    }
  }
  while (prevChild) {
    const next2 = prevChild.nextSibling;
    el.removeChild(prevChild);
    prevChild = next2;
  }
  return el;
}
var registeredHandlers = /* @__PURE__ */ new WeakMap();
function lustreGenericEventHandler(event2) {
  const target2 = event2.currentTarget;
  if (!registeredHandlers.has(target2)) {
    target2.removeEventListener(event2.type, lustreGenericEventHandler);
    return;
  }
  const handlersForEventTarget = registeredHandlers.get(target2);
  if (!handlersForEventTarget.has(event2.type)) {
    target2.removeEventListener(event2.type, lustreGenericEventHandler);
    return;
  }
  handlersForEventTarget.get(event2.type)(event2);
}
function lustreServerEventHandler(event2) {
  const el = event2.currentTarget;
  const tag = el.getAttribute(`data-lustre-on-${event2.type}`);
  const data = JSON.parse(el.getAttribute("data-lustre-data") || "{}");
  const include = JSON.parse(el.getAttribute("data-lustre-include") || "[]");
  switch (event2.type) {
    case "input":
    case "change":
      include.push("target.value");
      break;
  }
  return {
    tag,
    data: include.reduce(
      (data2, property) => {
        const path = property.split(".");
        for (let i = 0, o = data2, e = event2; i < path.length; i++) {
          if (i === path.length - 1) {
            o[path[i]] = e[path[i]];
          } else {
            o[path[i]] ??= {};
            e = e[path[i]];
            o = o[path[i]];
          }
        }
        return data2;
      },
      { data }
    )
  };
}
function getKeyedChildren(el) {
  const keyedChildren = /* @__PURE__ */ new Map();
  if (el) {
    for (const child of children(el)) {
      const key2 = child?.key || child?.getAttribute?.("data-lustre-key");
      if (key2)
        keyedChildren.set(key2, child);
    }
  }
  return keyedChildren;
}
function diffKeyedChild(prevChild, child, el, stack, incomingKeyedChildren, keyedChildren, seenKeys) {
  while (prevChild && !incomingKeyedChildren.has(prevChild.getAttribute("data-lustre-key"))) {
    const nextChild = prevChild.nextSibling;
    el.removeChild(prevChild);
    prevChild = nextChild;
  }
  if (keyedChildren.size === 0) {
    stack.unshift({ prev: prevChild, next: child, parent: el });
    prevChild = prevChild?.nextSibling;
    return prevChild;
  }
  if (seenKeys.has(child.key)) {
    console.warn(`Duplicate key found in Lustre vnode: ${child.key}`);
    stack.unshift({ prev: null, next: child, parent: el });
    return prevChild;
  }
  seenKeys.add(child.key);
  const keyedChild = keyedChildren.get(child.key);
  if (!keyedChild && !prevChild) {
    stack.unshift({ prev: null, next: child, parent: el });
    return prevChild;
  }
  if (!keyedChild && prevChild !== null) {
    const placeholder2 = document.createTextNode("");
    el.insertBefore(placeholder2, prevChild);
    stack.unshift({ prev: placeholder2, next: child, parent: el });
    return prevChild;
  }
  if (!keyedChild || keyedChild === prevChild) {
    stack.unshift({ prev: prevChild, next: child, parent: el });
    prevChild = prevChild?.nextSibling;
    return prevChild;
  }
  el.insertBefore(keyedChild, prevChild);
  stack.unshift({ prev: keyedChild, next: child, parent: el });
  return prevChild;
}
function* children(element2) {
  for (const child of element2.children) {
    yield* forceChild(child);
  }
}
function* forceChild(element2) {
  if (element2.elements !== void 0) {
    for (const inner of element2.elements) {
      yield* forceChild(inner);
    }
  } else if (element2.subtree !== void 0) {
    yield* forceChild(element2.subtree());
  } else {
    yield element2;
  }
}

// build/dev/javascript/lustre/lustre.ffi.mjs
var LustreClientApplication = class _LustreClientApplication {
  /**
   * @template Flags
   *
   * @param {object} app
   * @param {(flags: Flags) => [Model, Lustre.Effect<Msg>]} app.init
   * @param {(msg: Msg, model: Model) => [Model, Lustre.Effect<Msg>]} app.update
   * @param {(model: Model) => Lustre.Element<Msg>} app.view
   * @param {string | HTMLElement} selector
   * @param {Flags} flags
   *
   * @returns {Gleam.Ok<(action: Lustre.Action<Lustre.Client, Msg>>) => void>}
   */
  static start({ init: init4, update: update4, view: view13 }, selector, flags) {
    if (!is_browser())
      return new Error(new NotABrowser());
    const root = selector instanceof HTMLElement ? selector : document.querySelector(selector);
    if (!root)
      return new Error(new ElementNotFound(selector));
    const app = new _LustreClientApplication(root, init4(flags), update4, view13);
    return new Ok((action) => app.send(action));
  }
  /**
   * @param {Element} root
   * @param {[Model, Lustre.Effect<Msg>]} init
   * @param {(model: Model, msg: Msg) => [Model, Lustre.Effect<Msg>]} update
   * @param {(model: Model) => Lustre.Element<Msg>} view
   *
   * @returns {LustreClientApplication}
   */
  constructor(root, [init4, effects], update4, view13) {
    this.root = root;
    this.#model = init4;
    this.#update = update4;
    this.#view = view13;
    this.#tickScheduled = window.requestAnimationFrame(
      () => this.#tick(effects.all.toArray(), true)
    );
  }
  /** @type {Element} */
  root;
  /**
   * @param {Lustre.Action<Lustre.Client, Msg>} action
   *
   * @returns {void}
   */
  send(action) {
    if (action instanceof Debug) {
      if (action[0] instanceof ForceModel) {
        this.#tickScheduled = window.cancelAnimationFrame(this.#tickScheduled);
        this.#queue = [];
        this.#model = action[0][0];
        const vdom = this.#view(this.#model);
        const dispatch = (handler, immediate = false) => (event2) => {
          const result = handler(event2);
          if (result instanceof Ok) {
            this.send(new Dispatch(result[0], immediate));
          }
        };
        const prev = this.root.firstChild ?? this.root.appendChild(document.createTextNode(""));
        morph(prev, vdom, dispatch);
      }
    } else if (action instanceof Dispatch) {
      const msg = action[0];
      const immediate = action[1] ?? false;
      this.#queue.push(msg);
      if (immediate) {
        this.#tickScheduled = window.cancelAnimationFrame(this.#tickScheduled);
        this.#tick();
      } else if (!this.#tickScheduled) {
        this.#tickScheduled = window.requestAnimationFrame(() => this.#tick());
      }
    } else if (action instanceof Emit2) {
      const event2 = action[0];
      const data = action[1];
      this.root.dispatchEvent(
        new CustomEvent(event2, {
          detail: data,
          bubbles: true,
          composed: true
        })
      );
    } else if (action instanceof Shutdown) {
      this.#tickScheduled = window.cancelAnimationFrame(this.#tickScheduled);
      this.#model = null;
      this.#update = null;
      this.#view = null;
      this.#queue = null;
      while (this.root.firstChild) {
        this.root.firstChild.remove();
      }
    }
  }
  /** @type {Model} */
  #model;
  /** @type {(model: Model, msg: Msg) => [Model, Lustre.Effect<Msg>]} */
  #update;
  /** @type {(model: Model) => Lustre.Element<Msg>} */
  #view;
  /** @type {Array<Msg>} */
  #queue = [];
  /** @type {number | undefined} */
  #tickScheduled;
  /**
   * @param {Lustre.Effect<Msg>[]} effects
   * @param {boolean} isFirstRender
   */
  #tick(effects = [], isFirstRender = false) {
    this.#tickScheduled = void 0;
    if (!this.#flush(effects, isFirstRender))
      return;
    const vdom = this.#view(this.#model);
    const dispatch = (handler, immediate = false) => (event2) => {
      const result = handler(event2);
      if (result instanceof Ok) {
        this.send(new Dispatch(result[0], immediate));
      }
    };
    const prev = this.root.firstChild ?? this.root.appendChild(document.createTextNode(""));
    morph(prev, vdom, dispatch);
  }
  #flush(effects = [], didUpdate = false) {
    while (this.#queue.length > 0) {
      const msg = this.#queue.shift();
      const [next, effect] = this.#update(this.#model, msg);
      didUpdate ||= this.#model !== next;
      effects = effects.concat(effect.all.toArray());
      this.#model = next;
    }
    while (effects.length > 0) {
      const effect = effects.shift();
      const dispatch = (msg) => this.send(new Dispatch(msg));
      const emit2 = (event2, data) => this.root.dispatchEvent(
        new CustomEvent(event2, {
          detail: data,
          bubbles: true,
          composed: true
        })
      );
      const select = () => {
      };
      effect({ dispatch, emit: emit2, select });
    }
    if (this.#queue.length > 0) {
      return this.#flush(effects, didUpdate);
    } else {
      return didUpdate;
    }
  }
};
var start = LustreClientApplication.start;
var LustreServerApplication = class _LustreServerApplication {
  static start({ init: init4, update: update4, view: view13, on_attribute_change }, flags) {
    const app = new _LustreServerApplication(
      init4(flags),
      update4,
      view13,
      on_attribute_change
    );
    return new Ok((action) => app.send(action));
  }
  constructor([model, effects], update4, view13, on_attribute_change) {
    this.#model = model;
    this.#update = update4;
    this.#view = view13;
    this.#html = view13(model);
    this.#onAttributeChange = on_attribute_change;
    this.#renderers = /* @__PURE__ */ new Map();
    this.#handlers = handlers(this.#html);
    this.#tick(effects.all.toArray());
  }
  send(action) {
    if (action instanceof Attrs) {
      for (const attr of action[0]) {
        const decoder = this.#onAttributeChange.get(attr[0]);
        if (!decoder)
          continue;
        const msg = decoder(attr[1]);
        if (msg instanceof Error)
          continue;
        this.#queue.push(msg);
      }
      this.#tick();
    } else if (action instanceof Batch) {
      this.#queue = this.#queue.concat(action[0].toArray());
      this.#tick(action[1].all.toArray());
    } else if (action instanceof Debug) {
    } else if (action instanceof Dispatch) {
      this.#queue.push(action[0]);
      this.#tick();
    } else if (action instanceof Emit2) {
      const event2 = new Emit(action[0], action[1]);
      for (const [_, renderer] of this.#renderers) {
        renderer(event2);
      }
    } else if (action instanceof Event3) {
      const handler = this.#handlers.get(action[0]);
      if (!handler)
        return;
      const msg = handler(action[1]);
      if (msg instanceof Error)
        return;
      this.#queue.push(msg[0]);
      this.#tick();
    } else if (action instanceof Subscribe) {
      const attrs = keys(this.#onAttributeChange);
      const patch = new Init(attrs, this.#html);
      this.#renderers = this.#renderers.set(action[0], action[1]);
      action[1](patch);
    } else if (action instanceof Unsubscribe) {
      this.#renderers = this.#renderers.delete(action[0]);
    }
  }
  #model;
  #update;
  #queue;
  #view;
  #html;
  #renderers;
  #handlers;
  #onAttributeChange;
  #tick(effects = []) {
    if (!this.#flush(false, effects))
      return;
    const vdom = this.#view(this.#model);
    const diff2 = elements(this.#html, vdom);
    if (!is_empty_element_diff(diff2)) {
      const patch = new Diff(diff2);
      for (const [_, renderer] of this.#renderers) {
        renderer(patch);
      }
    }
    this.#html = vdom;
    this.#handlers = diff2.handlers;
  }
  #flush(didUpdate = false, effects = []) {
    while (this.#queue.length > 0) {
      const msg = this.#queue.shift();
      const [next, effect] = this.#update(this.#model, msg);
      didUpdate ||= this.#model !== next;
      effects = effects.concat(effect.all.toArray());
      this.#model = next;
    }
    while (effects.length > 0) {
      const effect = effects.shift();
      const dispatch = (msg) => this.send(new Dispatch(msg));
      const emit2 = (event2, data) => this.root.dispatchEvent(
        new CustomEvent(event2, {
          detail: data,
          bubbles: true,
          composed: true
        })
      );
      const select = () => {
      };
      effect({ dispatch, emit: emit2, select });
    }
    if (this.#queue.length > 0) {
      return this.#flush(didUpdate, effects);
    } else {
      return didUpdate;
    }
  }
};
var start_server_application = LustreServerApplication.start;
var is_browser = () => globalThis.window && window.document;
var prevent_default = (event2) => event2.preventDefault();

// build/dev/javascript/lustre/lustre.mjs
var App = class extends CustomType {
  constructor(init4, update4, view13, on_attribute_change) {
    super();
    this.init = init4;
    this.update = update4;
    this.view = view13;
    this.on_attribute_change = on_attribute_change;
  }
};
var ElementNotFound = class extends CustomType {
  constructor(selector) {
    super();
    this.selector = selector;
  }
};
var NotABrowser = class extends CustomType {
};
function application(init4, update4, view13) {
  return new App(init4, update4, view13, new None());
}
function start2(app, selector, flags) {
  return guard(
    !is_browser(),
    new Error(new NotABrowser()),
    () => {
      return start(app, selector, flags);
    }
  );
}

// build/dev/javascript/modem/modem.ffi.mjs
var defaults = {
  handle_external_links: false,
  handle_internal_links: true
};
var initial_location = window?.location?.href;
var do_init = (dispatch, options = defaults) => {
  document.addEventListener("click", (event2) => {
    const a2 = find_anchor(event2.target);
    if (!a2)
      return;
    try {
      const url = new URL(a2.href);
      const uri = uri_from_url(url);
      const is_external = url.host !== window.location.host;
      if (!options.handle_external_links && is_external)
        return;
      if (!options.handle_internal_links && !is_external)
        return;
      event2.preventDefault();
      if (!is_external) {
        window.history.pushState({}, "", a2.href);
        window.requestAnimationFrame(() => {
          if (url.hash) {
            document.getElementById(url.hash.slice(1))?.scrollIntoView();
          }
        });
      }
      return dispatch(uri);
    } catch {
      return;
    }
  });
  window.addEventListener("popstate", (e) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    const uri = uri_from_url(url);
    window.requestAnimationFrame(() => {
      if (url.hash) {
        document.getElementById(url.hash.slice(1))?.scrollIntoView();
      }
    });
    dispatch(uri);
  });
  window.addEventListener("modem-push", ({ detail }) => {
    dispatch(detail);
  });
  window.addEventListener("modem-replace", ({ detail }) => {
    dispatch(detail);
  });
};
var do_push = (uri) => {
  window.history.pushState({}, "", to_string4(uri));
  window.requestAnimationFrame(() => {
    if (uri.fragment[0]) {
      document.getElementById(uri.fragment[0])?.scrollIntoView();
    }
  });
  window.dispatchEvent(new CustomEvent("modem-push", { detail: uri }));
};
var do_load = (uri) => {
  window.location = to_string4(uri);
};
var find_anchor = (el) => {
  if (!el || el.tagName === "BODY") {
    return null;
  } else if (el.tagName === "A") {
    return el;
  } else {
    return find_anchor(el.parentElement);
  }
};
var uri_from_url = (url) => {
  return new Uri(
    /* scheme   */
    url.protocol ? new Some(url.protocol.slice(0, -1)) : new None(),
    /* userinfo */
    new None(),
    /* host     */
    url.hostname ? new Some(url.hostname) : new None(),
    /* port     */
    url.port ? new Some(Number(url.port)) : new None(),
    /* path     */
    url.pathname,
    /* query    */
    url.search ? new Some(url.search.slice(1)) : new None(),
    /* fragment */
    url.hash ? new Some(url.hash.slice(1)) : new None()
  );
};

// build/dev/javascript/modem/modem.mjs
function init2(handler) {
  return from(
    (dispatch) => {
      return guard(
        !is_browser(),
        void 0,
        () => {
          return do_init(
            (uri) => {
              let _pipe = uri;
              let _pipe$1 = handler(_pipe);
              return dispatch(_pipe$1);
            }
          );
        }
      );
    }
  );
}
function load(uri) {
  return from(
    (_) => {
      return guard(
        !is_browser(),
        void 0,
        () => {
          return do_load(uri);
        }
      );
    }
  );
}
var relative = /* @__PURE__ */ new Uri(
  /* @__PURE__ */ new None(),
  /* @__PURE__ */ new None(),
  /* @__PURE__ */ new None(),
  /* @__PURE__ */ new None(),
  "",
  /* @__PURE__ */ new None(),
  /* @__PURE__ */ new None()
);
function push(path, query, fragment) {
  return from(
    (_) => {
      return guard(
        !is_browser(),
        void 0,
        () => {
          return do_push(
            relative.withFields({ path, query, fragment })
          );
        }
      );
    }
  );
}

// build/dev/javascript/gleam_javascript/gleam_javascript_ffi.mjs
var PromiseLayer = class _PromiseLayer {
  constructor(promise) {
    this.promise = promise;
  }
  static wrap(value3) {
    return value3 instanceof Promise ? new _PromiseLayer(value3) : value3;
  }
  static unwrap(value3) {
    return value3 instanceof _PromiseLayer ? value3.promise : value3;
  }
};
function resolve(value3) {
  return Promise.resolve(PromiseLayer.wrap(value3));
}
function then_await(promise, fn) {
  return promise.then((value3) => fn(PromiseLayer.unwrap(value3)));
}
function map_promise(promise, fn) {
  return promise.then(
    (value3) => PromiseLayer.wrap(fn(PromiseLayer.unwrap(value3)))
  );
}
function rescue(promise, fn) {
  return promise.catch((error2) => fn(error2));
}

// build/dev/javascript/plinth/document_ffi.mjs
function getElementById(id2) {
  let found = document.getElementById(id2);
  if (!found) {
    return new Error();
  }
  return new Ok(found);
}

// build/dev/javascript/gleam_javascript/gleam/javascript/promise.mjs
function tap(promise, callback) {
  let _pipe = promise;
  return map_promise(
    _pipe,
    (a2) => {
      callback(a2);
      return a2;
    }
  );
}
function try_await(promise, callback) {
  let _pipe = promise;
  return then_await(
    _pipe,
    (result) => {
      if (result.isOk()) {
        let a2 = result[0];
        return callback(a2);
      } else {
        let e = result[0];
        return resolve(new Error(e));
      }
    }
  );
}

// build/dev/javascript/plinth/element_ffi.mjs
function value2(element2) {
  let value3 = element2.value;
  if (value3 != void 0) {
    return new Ok(value3);
  }
  return new Error();
}

// build/dev/javascript/plinth/window_ffi.mjs
function self() {
  return globalThis;
}
function alert(message) {
  window.alert(message);
}
function prompt(message, defaultValue) {
  let text3 = window.prompt(message, defaultValue);
  if (text3 !== null) {
    return new Ok(text3);
  } else {
    return new Error();
  }
}
function addEventListener3(type, listener) {
  return window.addEventListener(type, listener);
}
async function requestWakeLock() {
  try {
    return new Ok(await window.navigator.wakeLock.request("screen"));
  } catch (error2) {
    return new Error(error2.toString());
  }
}
function location() {
  return window.location.href;
}
function locationOf(w) {
  try {
    return new Ok(w.location.href);
  } catch (error2) {
    return new Error(error2.toString());
  }
}
function setLocation(w, url) {
  w.location.href = url;
}
function origin() {
  return window.location.origin;
}
function pathname() {
  return window.location.pathname;
}
function reload() {
  return window.location.reload();
}
function reloadOf(w) {
  return w.location.reload();
}
function focus2(w) {
  return w.focus();
}
function getHash2() {
  const hash = window.location.hash;
  if (hash == "") {
    return new Error();
  }
  return new Ok(decodeURIComponent(hash.slice(1)));
}
function getSearch() {
  const search4 = window.location.search;
  if (search4 == "") {
    return new Error();
  }
  return new Ok(decodeURIComponent(search4.slice(1)));
}
function innerHeight(w) {
  return w.innerHeight;
}
function innerWidth(w) {
  return w.innerWidth;
}
function outerHeight(w) {
  return w.outerHeight;
}
function outerWidth(w) {
  return w.outerWidth;
}
function screenX(w) {
  return w.screenX;
}
function screenY(w) {
  return w.screenY;
}
function screenTop(w) {
  return w.screenTop;
}
function screenLeft(w) {
  return w.screenLeft;
}
function scrollX(w) {
  return w.scrollX;
}
function scrollY(w) {
  return w.scrollY;
}
function open(url, target2, features) {
  try {
    return new Ok(window.open(url, target2, features));
  } catch (error2) {
    return new Error(error2.toString());
  }
}
function close(w) {
  w.close();
}
function closed(w) {
  return w.closed;
}
function queueMicrotask(callback) {
  return window.queueMicrotask(callback);
}
function requestAnimationFrame(callback) {
  return window.requestAnimationFrame(callback);
}
function cancelAnimationFrame(callback) {
  return window.cancelAnimationFrame(callback);
}
function eval_(string) {
  try {
    return new Ok(eval(string));
  } catch (error2) {
    return new Error(error2.toString());
  }
}
async function import_(string5) {
  try {
    return new Ok(await import(string5));
  } catch (error2) {
    return new Error(error2.toString());
  }
}

// build/dev/javascript/plinth/console_ffi.mjs
function error(value3) {
  console.error(value3);
}

// build/dev/javascript/lustre/lustre/element/html.mjs
function text2(content) {
  return text(content);
}
function aside(attrs, children2) {
  return element("aside", attrs, children2);
}
function h1(attrs, children2) {
  return element("h1", attrs, children2);
}
function h2(attrs, children2) {
  return element("h2", attrs, children2);
}
function h3(attrs, children2) {
  return element("h3", attrs, children2);
}
function div(attrs, children2) {
  return element("div", attrs, children2);
}
function li(attrs, children2) {
  return element("li", attrs, children2);
}
function p(attrs, children2) {
  return element("p", attrs, children2);
}
function ul(attrs, children2) {
  return element("ul", attrs, children2);
}
function a(attrs, children2) {
  return element("a", attrs, children2);
}
function span(attrs, children2) {
  return element("span", attrs, children2);
}
function img(attrs) {
  return element("img", attrs, toList([]));
}
function button(attrs, children2) {
  return element("button", attrs, children2);
}
function form(attrs, children2) {
  return element("form", attrs, children2);
}
function input(attrs) {
  return element("input", attrs, toList([]));
}
function label(attrs, children2) {
  return element("label", attrs, children2);
}
function dialog(attrs, children2) {
  return element("dialog", attrs, children2);
}

// build/dev/javascript/gleam_http/gleam/http.mjs
var Get = class extends CustomType {
};
var Post = class extends CustomType {
};
var Head = class extends CustomType {
};
var Put = class extends CustomType {
};
var Delete = class extends CustomType {
};
var Trace = class extends CustomType {
};
var Connect = class extends CustomType {
};
var Options2 = class extends CustomType {
};
var Patch = class extends CustomType {
};
var Http = class extends CustomType {
};
var Https = class extends CustomType {
};
function method_to_string(method) {
  if (method instanceof Connect) {
    return "connect";
  } else if (method instanceof Delete) {
    return "delete";
  } else if (method instanceof Get) {
    return "get";
  } else if (method instanceof Head) {
    return "head";
  } else if (method instanceof Options2) {
    return "options";
  } else if (method instanceof Patch) {
    return "patch";
  } else if (method instanceof Post) {
    return "post";
  } else if (method instanceof Put) {
    return "put";
  } else if (method instanceof Trace) {
    return "trace";
  } else {
    let s = method[0];
    return s;
  }
}
function scheme_to_string(scheme) {
  if (scheme instanceof Http) {
    return "http";
  } else {
    return "https";
  }
}

// build/dev/javascript/gleam_http/gleam/http/request.mjs
var Request = class extends CustomType {
  constructor(method, headers, body2, scheme, host, port, path, query) {
    super();
    this.method = method;
    this.headers = headers;
    this.body = body2;
    this.scheme = scheme;
    this.host = host;
    this.port = port;
    this.path = path;
    this.query = query;
  }
};
function to_uri(request) {
  return new Uri(
    new Some(scheme_to_string(request.scheme)),
    new None(),
    new Some(request.host),
    request.port,
    request.path,
    request.query,
    new None()
  );
}
function set_header(request, key2, value3) {
  let headers = key_set(request.headers, lowercase2(key2), value3);
  return request.withFields({ headers });
}
function set_body(req, body2) {
  let method = req.method;
  let headers = req.headers;
  let scheme = req.scheme;
  let host = req.host;
  let port = req.port;
  let path = req.path;
  let query = req.query;
  return new Request(method, headers, body2, scheme, host, port, path, query);
}
function set_query(req, query) {
  let pair = (t) => {
    return from_strings(
      toList([percent_encode2(t[0]), "=", percent_encode2(t[1])])
    );
  };
  let query$1 = (() => {
    let _pipe = query;
    let _pipe$1 = map2(_pipe, pair);
    let _pipe$2 = intersperse(_pipe$1, from_string("&"));
    let _pipe$3 = concat2(_pipe$2);
    let _pipe$4 = to_string3(_pipe$3);
    return new Some(_pipe$4);
  })();
  return req.withFields({ query: query$1 });
}
function set_method(req, method) {
  return req.withFields({ method });
}
function new$4() {
  return new Request(
    new Get(),
    toList([]),
    "",
    new Https(),
    "localhost",
    new None(),
    "",
    new None()
  );
}
function set_scheme(req, scheme) {
  return req.withFields({ scheme });
}
function set_host(req, host) {
  return req.withFields({ host });
}
function set_port(req, port) {
  return req.withFields({ port: new Some(port) });
}
function set_path(req, path) {
  return req.withFields({ path });
}

// build/dev/javascript/gleam_http/gleam/http/response.mjs
var Response = class extends CustomType {
  constructor(status, headers, body2) {
    super();
    this.status = status;
    this.headers = headers;
    this.body = body2;
  }
};

// build/dev/javascript/gleam_fetch/ffi.mjs
async function raw_send(request) {
  try {
    return new Ok(await fetch(request));
  } catch (error2) {
    return new Error(new NetworkError(error2.toString()));
  }
}
function from_fetch_response(response) {
  return new Response(
    response.status,
    List.fromArray([...response.headers]),
    response
  );
}
function to_fetch_request(request) {
  let url = to_string4(to_uri(request));
  let method = method_to_string(request.method).toUpperCase();
  let options = {
    headers: make_headers(request.headers),
    method
  };
  if (method !== "GET" && method !== "HEAD")
    options.body = request.body;
  return new globalThis.Request(url, options);
}
function make_headers(headersList) {
  let headers = new globalThis.Headers();
  for (let [k, v] of headersList)
    headers.append(k.toLowerCase(), v);
  return headers;
}
async function read_text_body(response) {
  let body2;
  try {
    body2 = await response.body.text();
  } catch (error2) {
    return new Error(new UnableToReadBody());
  }
  return new Ok(response.withFields({ body: body2 }));
}

// build/dev/javascript/gleam_fetch/gleam/fetch.mjs
var NetworkError = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var UnableToReadBody = class extends CustomType {
};
function send(request) {
  let _pipe = request;
  let _pipe$1 = to_fetch_request(_pipe);
  let _pipe$2 = raw_send(_pipe$1);
  return try_await(
    _pipe$2,
    (resp) => {
      return resolve(new Ok(from_fetch_response(resp)));
    }
  );
}

// build/dev/javascript/lustre_http/lustre_http.mjs
var InternalServerError = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var JsonError = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var NetworkError2 = class extends CustomType {
};
var NotFound = class extends CustomType {
};
var OtherError = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Unauthorized = class extends CustomType {
};
var ExpectTextResponse = class extends CustomType {
  constructor(run) {
    super();
    this.run = run;
  }
};
function do_send(req, expect, dispatch) {
  let _pipe = send(req);
  let _pipe$1 = try_await(_pipe, read_text_body);
  let _pipe$2 = map_promise(
    _pipe$1,
    (response) => {
      if (response.isOk()) {
        let res = response[0];
        return expect.run(new Ok(res));
      } else {
        return expect.run(new Error(new NetworkError2()));
      }
    }
  );
  let _pipe$3 = rescue(
    _pipe$2,
    (_) => {
      return expect.run(new Error(new NetworkError2()));
    }
  );
  tap(_pipe$3, dispatch);
  return void 0;
}
function send2(req, expect) {
  return from((_capture) => {
    return do_send(req, expect, _capture);
  });
}
function response_to_result(response) {
  if (response instanceof Response && (200 <= response.status && response.status <= 299)) {
    let status = response.status;
    let body2 = response.body;
    return new Ok(body2);
  } else if (response instanceof Response && response.status === 401) {
    return new Error(new Unauthorized());
  } else if (response instanceof Response && response.status === 404) {
    return new Error(new NotFound());
  } else if (response instanceof Response && response.status === 500) {
    let body2 = response.body;
    return new Error(new InternalServerError(body2));
  } else {
    let code = response.status;
    let body2 = response.body;
    return new Error(new OtherError(code, body2));
  }
}
function expect_text(to_msg) {
  return new ExpectTextResponse(
    (response) => {
      let _pipe = response;
      let _pipe$1 = then$(_pipe, response_to_result);
      return to_msg(_pipe$1);
    }
  );
}

// build/dev/javascript/glitr_convert/glitr/convert.mjs
var String2 = class extends CustomType {
};
var Bool = class extends CustomType {
};
var Float = class extends CustomType {
};
var Int = class extends CustomType {
};
var List2 = class extends CustomType {
  constructor(of) {
    super();
    this.of = of;
  }
};
var Dict2 = class extends CustomType {
  constructor(key2, value3) {
    super();
    this.key = key2;
    this.value = value3;
  }
};
var Object2 = class extends CustomType {
  constructor(fields) {
    super();
    this.fields = fields;
  }
};
var Optional = class extends CustomType {
  constructor(of) {
    super();
    this.of = of;
  }
};
var Result2 = class extends CustomType {
  constructor(result, error2) {
    super();
    this.result = result;
    this.error = error2;
  }
};
var Enum = class extends CustomType {
  constructor(variants) {
    super();
    this.variants = variants;
  }
};
var StringValue = class extends CustomType {
  constructor(value3) {
    super();
    this.value = value3;
  }
};
var BoolValue = class extends CustomType {
  constructor(value3) {
    super();
    this.value = value3;
  }
};
var FloatValue = class extends CustomType {
  constructor(value3) {
    super();
    this.value = value3;
  }
};
var IntValue = class extends CustomType {
  constructor(value3) {
    super();
    this.value = value3;
  }
};
var NullValue = class extends CustomType {
};
var ListValue = class extends CustomType {
  constructor(value3) {
    super();
    this.value = value3;
  }
};
var DictValue = class extends CustomType {
  constructor(value3) {
    super();
    this.value = value3;
  }
};
var ObjectValue = class extends CustomType {
  constructor(value3) {
    super();
    this.value = value3;
  }
};
var OptionalValue = class extends CustomType {
  constructor(value3) {
    super();
    this.value = value3;
  }
};
var ResultValue = class extends CustomType {
  constructor(value3) {
    super();
    this.value = value3;
  }
};
var EnumValue = class extends CustomType {
  constructor(variant, value3) {
    super();
    this.variant = variant;
    this.value = value3;
  }
};
var Converter = class extends CustomType {
  constructor(encoder, decoder, type_def2) {
    super();
    this.encoder = encoder;
    this.decoder = decoder;
    this.type_def = type_def2;
  }
};
var ObjectDefinition = class extends CustomType {
  constructor(constructor2) {
    super();
    this.constructor = constructor2;
  }
};
var ObjectParameterDefinition = class extends CustomType {
  constructor(constructor2) {
    super();
    this.constructor = constructor2;
  }
};
var ObjectConverterBuilder = class extends CustomType {
  constructor(encoder, decoder, type_def2) {
    super();
    this.encoder = encoder;
    this.decoder = decoder;
    this.type_def = type_def2;
  }
};
function object3(object_converter) {
  return new ObjectConverterBuilder(
    (_, _1) => {
      return new ObjectValue(toList([]));
    },
    (_, curr) => {
      if (object_converter instanceof ObjectDefinition) {
        let constructor$1 = object_converter.constructor;
        return new Ok(constructor$1());
      } else {
        let constructor$1 = object_converter.constructor;
        return new Ok(constructor$1(curr));
      }
    },
    new Object2(toList([]))
  );
}
function parameter(next) {
  return new ObjectParameterDefinition(
    (v) => {
      let $ = next(v[0]);
      if ($ instanceof ObjectDefinition) {
        let constructor$1 = $.constructor;
        return constructor$1();
      } else {
        let constructor$1 = $.constructor;
        return constructor$1(v[1]);
      }
    }
  );
}
function constructor(c) {
  return new ObjectDefinition(c);
}
function to_converter(converter) {
  return new Converter(
    (_capture) => {
      return converter.encoder(_capture, void 0);
    },
    (_capture) => {
      return converter.decoder(_capture, void 0);
    },
    converter.type_def
  );
}
function get_type(val) {
  if (val instanceof BoolValue) {
    return "BoolValue";
  } else if (val instanceof DictValue) {
    return "DictValue";
  } else if (val instanceof EnumValue) {
    return "EnumValue";
  } else if (val instanceof FloatValue) {
    return "FloatValue";
  } else if (val instanceof IntValue) {
    return "IntValue";
  } else if (val instanceof ListValue) {
    return "ListValue";
  } else if (val instanceof NullValue) {
    return "NullValue";
  } else if (val instanceof ObjectValue) {
    return "ObjectValue";
  } else if (val instanceof OptionalValue) {
    return "OptionalValue";
  } else if (val instanceof ResultValue) {
    return "ResultValue";
  } else {
    return "StringValue";
  }
}
function string4() {
  return new Converter(
    (v) => {
      return new StringValue(v);
    },
    (v) => {
      if (v instanceof StringValue) {
        let val = v.value;
        return new Ok(val);
      } else {
        let other = v;
        return new Error(
          toList([
            new DecodeError("StringValue", get_type(other), toList([]))
          ])
        );
      }
    },
    new String2()
  );
}
function list2(of) {
  return new Converter(
    (v) => {
      return new ListValue(
        (() => {
          let _pipe = v;
          return map2(_pipe, of.encoder);
        })()
      );
    },
    (v) => {
      if (v instanceof ListValue) {
        let vals = v.value;
        let _pipe = vals;
        return fold(
          _pipe,
          new Ok(toList([])),
          (result, val) => {
            let $ = of.decoder(val);
            if (result.isOk() && $.isOk()) {
              let res = result[0];
              let new_res = $[0];
              return new Ok(append(res, toList([new_res])));
            } else if (!result.isOk() && !$.isOk()) {
              let errs = result[0];
              let new_errs = $[0];
              return new Error(append(errs, new_errs));
            } else if (!$.isOk()) {
              let errs = $[0];
              return new Error(errs);
            } else {
              let errs = result[0];
              return new Error(errs);
            }
          }
        );
      } else {
        let other = v;
        return new Error(
          toList([
            new DecodeError("ListValue", get_type(other), toList([]))
          ])
        );
      }
    },
    new List2(of.type_def)
  );
}
function field2(converter, field_name, field_getter, field_type) {
  return new ObjectConverterBuilder(
    (base, curr) => {
      let value3 = field_getter(base);
      if (!value3.isOk() && !value3[0]) {
        return new NullValue();
      } else {
        let field_value = value3[0];
        let $ = converter.encoder(base, [field_value, curr]);
        if ($ instanceof ObjectValue) {
          let fields = $.value;
          return new ObjectValue(
            append(
              fields,
              toList([[field_name, field_type.encoder(field_value)]])
            )
          );
        } else {
          return new NullValue();
        }
      }
    },
    (v, curr) => {
      if (v instanceof ObjectValue) {
        let values = v.value;
        let field_value = (() => {
          let _pipe = values;
          let _pipe$1 = key_find(_pipe, field_name);
          let _pipe$2 = replace_error(
            _pipe$1,
            toList([
              new DecodeError("Value", "None", toList([field_name]))
            ])
          );
          return then$(_pipe$2, field_type.decoder);
        })();
        return try$(
          field_value,
          (a2) => {
            return converter.decoder(v, [a2, curr]);
          }
        );
      } else {
        return new Error(toList([]));
      }
    },
    (() => {
      let $ = converter.type_def;
      if ($ instanceof Object2) {
        let fields = $.fields;
        return new Object2(
          append(fields, toList([[field_name, field_type.type_def]]))
        );
      } else {
        return new Object2(toList([[field_name, field_type.type_def]]));
      }
    })()
  );
}
function optional2(of) {
  return new Converter(
    (v) => {
      return new OptionalValue(
        (() => {
          let _pipe = v;
          return map(_pipe, of.encoder);
        })()
      );
    },
    (v) => {
      if (v instanceof OptionalValue && v.value instanceof None) {
        return new Ok(new None());
      } else if (v instanceof OptionalValue && v.value instanceof Some) {
        let val = v.value[0];
        let _pipe = val;
        let _pipe$1 = of.decoder(_pipe);
        return map3(
          _pipe$1,
          (var0) => {
            return new Some(var0);
          }
        );
      } else {
        let other = v;
        return new Error(
          toList([
            new DecodeError(
              "OptionalValue",
              get_type(other),
              toList([])
            )
          ])
        );
      }
    },
    new Optional(of.type_def)
  );
}
function enum$(tags, converters) {
  return new Converter(
    (v) => {
      let tag = tags(v);
      let $ = (() => {
        let _pipe = converters;
        return key_find(_pipe, tag);
      })();
      if ($.isOk()) {
        let variant = $[0];
        return new EnumValue(tag, variant.encoder(v));
      } else {
        return new NullValue();
      }
    },
    (v) => {
      if (v instanceof EnumValue) {
        let variant_name = v.variant;
        let value3 = v.value;
        return try$(
          (() => {
            let _pipe = converters;
            let _pipe$1 = key_find(_pipe, variant_name);
            return replace_error(
              _pipe$1,
              toList([
                new DecodeError(
                  "One of: " + (() => {
                    let _pipe$2 = converters;
                    let _pipe$3 = map2(_pipe$2, (v2) => {
                      return v2[0];
                    });
                    return join2(_pipe$3, "/");
                  })(),
                  variant_name,
                  toList(["0"])
                )
              ])
            );
          })(),
          (variant) => {
            return variant.decoder(value3);
          }
        );
      } else {
        let other = v;
        return new Error(
          toList([
            new DecodeError("EnumValue", get_type(other), toList([]))
          ])
        );
      }
    },
    new Enum(
      (() => {
        let _pipe = converters;
        return map2(
          _pipe,
          (var$) => {
            return [var$[0], var$[1].type_def];
          }
        );
      })()
    )
  );
}
function encode(converter) {
  return converter.encoder;
}
function decode3(converter) {
  return converter.decoder;
}
function type_def(converter) {
  return converter.type_def;
}

// build/dev/javascript/shared/shared/types/song.mjs
var Song = class extends CustomType {
  constructor(id2, title, artists, album, album_cover3, source, preview_url) {
    super();
    this.id = id2;
    this.title = title;
    this.artists = artists;
    this.album = album;
    this.album_cover = album_cover3;
    this.source = source;
    this.preview_url = preview_url;
  }
};
var Youtube = class extends CustomType {
  constructor(url) {
    super();
    this.url = url;
  }
};
var Spotify = class extends CustomType {
  constructor(url) {
    super();
    this.url = url;
  }
};
function song_source_converter() {
  let youtube_source_converter = (() => {
    let _pipe = object3(
      parameter(
        (url) => {
          return constructor(() => {
            return new Youtube(url);
          });
        }
      )
    );
    let _pipe$1 = field2(
      _pipe,
      "url",
      (v) => {
        if (v instanceof Youtube) {
          let url = v.url;
          return new Ok(url);
        } else {
          return new Error(void 0);
        }
      },
      string4()
    );
    return to_converter(_pipe$1);
  })();
  let spotify_source_converter = (() => {
    let _pipe = object3(
      parameter(
        (url) => {
          return constructor(() => {
            return new Spotify(url);
          });
        }
      )
    );
    let _pipe$1 = field2(
      _pipe,
      "url",
      (v) => {
        if (v instanceof Spotify) {
          let url = v.url;
          return new Ok(url);
        } else {
          return new Error(void 0);
        }
      },
      string4()
    );
    return to_converter(_pipe$1);
  })();
  return enum$(
    (v) => {
      if (v instanceof Spotify) {
        return "spotify";
      } else {
        return "youtube";
      }
    },
    toList([
      ["spotify", spotify_source_converter],
      ["youtube", youtube_source_converter]
    ])
  );
}
function song_converter() {
  let _pipe = object3(
    parameter(
      (id2) => {
        return parameter(
          (title) => {
            return parameter(
              (artists) => {
                return parameter(
                  (album) => {
                    return parameter(
                      (album_cover3) => {
                        return parameter(
                          (source) => {
                            return parameter(
                              (preview_url) => {
                                return constructor(
                                  () => {
                                    return new Song(
                                      id2,
                                      title,
                                      artists,
                                      album,
                                      album_cover3,
                                      source,
                                      preview_url
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    )
  );
  let _pipe$1 = field2(
    _pipe,
    "id",
    (v) => {
      return new Ok(v.id);
    },
    string4()
  );
  let _pipe$2 = field2(
    _pipe$1,
    "title",
    (v) => {
      return new Ok(v.title);
    },
    string4()
  );
  let _pipe$3 = field2(
    _pipe$2,
    "artists",
    (v) => {
      return new Ok(v.artists);
    },
    list2(string4())
  );
  let _pipe$4 = field2(
    _pipe$3,
    "album",
    (v) => {
      return new Ok(v.album);
    },
    string4()
  );
  let _pipe$5 = field2(
    _pipe$4,
    "album_cover",
    (v) => {
      return new Ok(v.album_cover);
    },
    string4()
  );
  let _pipe$6 = field2(
    _pipe$5,
    "source",
    (v) => {
      return new Ok(v.source);
    },
    song_source_converter()
  );
  let _pipe$7 = field2(
    _pipe$6,
    "preview_url",
    (v) => {
      return new Ok(v.preview_url);
    },
    optional2(string4())
  );
  return to_converter(_pipe$7);
}

// build/dev/javascript/shared/shared/types/playlist_song.mjs
var PlaylistSong = class extends CustomType {
  constructor(id2, playlist_id, song_id, title, artists, album, album_cover3, source) {
    super();
    this.id = id2;
    this.playlist_id = playlist_id;
    this.song_id = song_id;
    this.title = title;
    this.artists = artists;
    this.album = album;
    this.album_cover = album_cover3;
    this.source = source;
  }
};
function playlist_song_converter() {
  let _pipe = object3(
    parameter(
      (id2) => {
        return parameter(
          (playlist_id) => {
            return parameter(
              (song_id) => {
                return parameter(
                  (title) => {
                    return parameter(
                      (artists) => {
                        return parameter(
                          (album) => {
                            return parameter(
                              (album_cover3) => {
                                return parameter(
                                  (source) => {
                                    return constructor(
                                      () => {
                                        return new PlaylistSong(
                                          id2,
                                          playlist_id,
                                          song_id,
                                          title,
                                          artists,
                                          album,
                                          album_cover3,
                                          source
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    )
  );
  let _pipe$1 = field2(
    _pipe,
    "id",
    (v) => {
      return new Ok(v.id);
    },
    string4()
  );
  let _pipe$2 = field2(
    _pipe$1,
    "playlist_id",
    (v) => {
      return new Ok(v.playlist_id);
    },
    string4()
  );
  let _pipe$3 = field2(
    _pipe$2,
    "song_id",
    (v) => {
      return new Ok(v.song_id);
    },
    string4()
  );
  let _pipe$4 = field2(
    _pipe$3,
    "title",
    (v) => {
      return new Ok(v.title);
    },
    string4()
  );
  let _pipe$5 = field2(
    _pipe$4,
    "artists",
    (v) => {
      return new Ok(v.artists);
    },
    list2(string4())
  );
  let _pipe$6 = field2(
    _pipe$5,
    "album",
    (v) => {
      return new Ok(v.album);
    },
    string4()
  );
  let _pipe$7 = field2(
    _pipe$6,
    "album_cover",
    (v) => {
      return new Ok(v.album_cover);
    },
    string4()
  );
  let _pipe$8 = field2(
    _pipe$7,
    "source",
    (v) => {
      return new Ok(v.source);
    },
    song_source_converter()
  );
  return to_converter(_pipe$8);
}

// build/dev/javascript/shared/shared/types/playlist.mjs
var Playlist = class extends CustomType {
  constructor(id2, name, songs) {
    super();
    this.id = id2;
    this.name = name;
    this.songs = songs;
  }
};
var UpsertPlaylist = class extends CustomType {
  constructor(name) {
    super();
    this.name = name;
  }
};
function playlist_converter() {
  let _pipe = object3(
    parameter(
      (id2) => {
        return parameter(
          (name) => {
            return parameter(
              (songs) => {
                return constructor(
                  () => {
                    return new Playlist(id2, name, songs);
                  }
                );
              }
            );
          }
        );
      }
    )
  );
  let _pipe$1 = field2(
    _pipe,
    "id",
    (v) => {
      return new Ok(v.id);
    },
    string4()
  );
  let _pipe$2 = field2(
    _pipe$1,
    "name",
    (v) => {
      return new Ok(v.name);
    },
    string4()
  );
  let _pipe$3 = field2(
    _pipe$2,
    "songs",
    (v) => {
      return new Ok(v.songs);
    },
    list2(playlist_song_converter())
  );
  return to_converter(_pipe$3);
}
function upsert_playlist_converter() {
  let _pipe = object3(
    parameter(
      (name) => {
        return constructor(() => {
          return new UpsertPlaylist(name);
        });
      }
    )
  );
  let _pipe$1 = field2(
    _pipe,
    "name",
    (v) => {
      return new Ok(v.name);
    },
    string4()
  );
  return to_converter(_pipe$1);
}

// build/dev/javascript/client/client/events/playlist_events.mjs
var CreatePlaylist = class extends CustomType {
  constructor(name) {
    super();
    this.name = name;
  }
};
var UpdatePlaylist = class extends CustomType {
  constructor(id2, name) {
    super();
    this.id = id2;
    this.name = name;
  }
};
var DeletePlaylist = class extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
};
var ServerSentPlaylists = class extends CustomType {
  constructor(playlists) {
    super();
    this.playlists = playlists;
  }
};
var ServerSentPlaylist = class extends CustomType {
  constructor(playlist) {
    super();
    this.playlist = playlist;
  }
};
var ServerCreatedPlaylist = class extends CustomType {
  constructor(playlist) {
    super();
    this.playlist = playlist;
  }
};
var ServerUpdatedPlaylist = class extends CustomType {
  constructor(playlist) {
    super();
    this.playlist = playlist;
  }
};
var ServerDeletedPlaylist = class extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
};

// build/dev/javascript/client/client/events/song_events.mjs
var SearchSongs = class extends CustomType {
  constructor(search4) {
    super();
    this.search = search4;
  }
};
var ServerSentSongs = class extends CustomType {
  constructor(results) {
    super();
    this.results = results;
  }
};
var PlayPreview = class extends CustomType {
  constructor(preview_url) {
    super();
    this.preview_url = preview_url;
  }
};

// build/dev/javascript/client/client/types/route.mjs
var Home = class extends CustomType {
};
var Login = class extends CustomType {
};
var Playlist2 = class extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
};
var Search = class extends CustomType {
  constructor(searching, results) {
    super();
    this.searching = searching;
    this.results = results;
  }
};

// build/dev/javascript/client/client/types/msg.mjs
var SongEvent = class extends CustomType {
  constructor(ev) {
    super();
    this.ev = ev;
  }
};
var PlaylistEvent = class extends CustomType {
  constructor(ev) {
    super();
    this.ev = ev;
  }
};
var ServerError = class extends CustomType {
  constructor(error2) {
    super();
    this.error = error2;
  }
};
var ClientError = class extends CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
};
var OpenDialog = class extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
};
var CloseDialog = class extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
};
var OnRouteChange = class extends CustomType {
  constructor(route) {
    super();
    this.route = route;
  }
};

// build/dev/javascript/client/client/components/layout.mjs
function layout(children2, left_children) {
  return div(
    toList([
      class$(
        "bg-zinc-800 min-w-screen min-h-screen max-h-screen text-pink-100 p-4 flex flex-nowrap items-stretch"
      )
    ]),
    toList([
      aside(
        toList([
          class$(
            "w-1/8 md:w-1/6 lg:w-1/4 max-w-lg bg-zinc-900 rounded-lg"
          )
        ]),
        left_children
      ),
      div(
        toList([
          class$(
            "py-8 px-4 grow flex flex-col items-center overflow-y-scroll"
          )
        ]),
        toList([
          div(
            toList([class$("max-w-3xl flex flex-col items-stretch")]),
            children2
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/lustre/lustre/event.mjs
function on2(name, handler) {
  return on(name, handler);
}
function on_click(msg) {
  return on2("click", (_) => {
    return new Ok(msg);
  });
}

// build/dev/javascript/client/client/components/playlists/create_playlist.mjs
function on_create(_) {
  let element2 = getElementById("create-playlist-name");
  if (!element2.isOk()) {
    return new Ok(
      new ClientError("Couldn't find element with id create-playlist-name")
    );
  } else {
    let el = element2[0];
    let value3 = (() => {
      let _pipe = el;
      return value2(_pipe);
    })();
    if (!value3.isOk()) {
      return new Ok(new ClientError("Couldn't get value of element"));
    } else {
      let name = value3[0];
      return new Ok(
        new PlaylistEvent(new CreatePlaylist(name))
      );
    }
  }
}
function view() {
  return dialog(
    toList([
      id("create-playlist"),
      class$(
        "p-4 rounded-lg backdrop:bg-zinc-900 backdrop:opacity-80"
      )
    ]),
    toList([
      h1(
        toList([class$("text-2xl font-bold mb-4")]),
        toList([text2("Create a new playlist")])
      ),
      div(
        toList([class$("flex flex-col gap-4")]),
        toList([
          label(
            toList([class$("flex gap-2 items-center")]),
            toList([
              span(toList([]), toList([text2("Playlist name")])),
              input(
                toList([
                  id("create-playlist-name"),
                  placeholder("Playlist name..."),
                  class$(
                    "p-2 rounded-md bg-zinc-100 focus:bg-zinc-200"
                  )
                ])
              )
            ])
          ),
          div(
            toList([class$("flex justify-end")]),
            toList([
              button(
                toList([
                  class$("p-2 bg-zinc-100"),
                  on2(
                    "click",
                    (_) => {
                      return new Ok(new CloseDialog("create-playlist"));
                    }
                  )
                ]),
                toList([text2("Close")])
              ),
              button(
                toList([
                  class$("p-2 bg-green-500 text-zinc-100"),
                  on2("click", on_create)
                ]),
                toList([text2("Create")])
              )
            ])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/glitr/glitr/error.mjs
var RouteError = class extends CustomType {
  constructor(msg) {
    super();
    this.msg = msg;
  }
};
var JsonDecodeError = class extends CustomType {
  constructor(err) {
    super();
    this.err = err;
  }
};

// build/dev/javascript/glitr/glitr/body.mjs
var EmptyBody = class extends CustomType {
};
var StringBody = class extends CustomType {
};
var JsonBody = class extends CustomType {
};
var BodyConverter = class extends CustomType {
  constructor(encoder, decoder) {
    super();
    this.encoder = encoder;
    this.decoder = decoder;
  }
};
var RouteBody = class extends CustomType {
  constructor(btype, converter) {
    super();
    this.btype = btype;
    this.converter = converter;
  }
};
function empty_body() {
  return new RouteBody(
    new EmptyBody(),
    new BodyConverter(
      (_) => {
        return new$2();
      },
      (_) => {
        return new Ok(void 0);
      }
    )
  );
}
function json_body(encoder, decoder) {
  return new RouteBody(
    new JsonBody(),
    new BodyConverter(
      (value3) => {
        let _pipe = value3;
        let _pipe$1 = encoder(_pipe);
        return to_string_builder(_pipe$1);
      },
      (body2) => {
        let _pipe = decode2(body2, decoder);
        return map_error(
          _pipe,
          (err) => {
            return new JsonDecodeError(err);
          }
        );
      }
    )
  );
}
function encode2(body2, value3) {
  let _pipe = value3;
  return body2.converter.encoder(_pipe);
}
function decode4(body2, value3) {
  let _pipe = value3;
  return body2.converter.decoder(_pipe);
}
function get_type2(body2) {
  return body2.btype;
}

// build/dev/javascript/glitr/glitr/path.mjs
var StaticPath = class extends CustomType {
};
var ComplexPath = class extends CustomType {
};
var PathConverter = class extends CustomType {
  constructor(encoder, decoder) {
    super();
    this.encoder = encoder;
    this.decoder = decoder;
  }
};
var RoutePath = class extends CustomType {
  constructor(ptype, converter) {
    super();
    this.ptype = ptype;
    this.converter = converter;
  }
};
function static_path(root) {
  return new RoutePath(
    new StaticPath(),
    new PathConverter(
      (_) => {
        return root;
      },
      (path) => {
        return guard(
          isEqual(path, root),
          new Ok(void 0),
          () => {
            return new Error(void 0);
          }
        );
      }
    )
  );
}
function id_path(root) {
  return new RoutePath(
    new ComplexPath(),
    new PathConverter(
      (id2) => {
        return append(root, toList([id2]));
      },
      (segs) => {
        let reverse_root = reverse(root);
        let $ = reverse(segs);
        if ($.atLeastLength(1) && isEqual($.tail, reverse_root)) {
          let id2 = $.head;
          let rest = $.tail;
          return new Ok(id2);
        } else {
          return new Error(void 0);
        }
      }
    )
  );
}
function encode3(path, value3) {
  let _pipe = value3;
  return path.converter.encoder(_pipe);
}
function get_type3(path) {
  return path.ptype;
}

// build/dev/javascript/glitr/glitr/query.mjs
var EmptyQuery = class extends CustomType {
};
var ComplexQuery = class extends CustomType {
};
var QueryConverter = class extends CustomType {
  constructor(encoder, decoder) {
    super();
    this.encoder = encoder;
    this.decoder = decoder;
  }
};
var RouteQuery = class extends CustomType {
  constructor(qtype, converter) {
    super();
    this.qtype = qtype;
    this.converter = converter;
  }
};
function empty_query() {
  return new RouteQuery(
    new EmptyQuery(),
    new QueryConverter(
      (_) => {
        return toList([]);
      },
      (_) => {
        return new Ok(void 0);
      }
    )
  );
}
function complex_query(converter) {
  return new RouteQuery(new ComplexQuery(), converter);
}
function encode4(query, value3) {
  let _pipe = value3;
  return query.converter.encoder(_pipe);
}
function get_type4(query) {
  return query.qtype;
}

// build/dev/javascript/glitr/glitr/route.mjs
var Route = class extends CustomType {
  constructor(method, path, query, req_body, res_body) {
    super();
    this.method = method;
    this.path = path;
    this.query = query;
    this.req_body = req_body;
    this.res_body = res_body;
  }
};
function new$5() {
  return new Route(
    new Get(),
    static_path(toList([])),
    empty_query(),
    empty_body(),
    empty_body()
  );
}
function with_method(route, method) {
  return route.withFields({ method });
}
function with_path(route, path) {
  return new Route(
    route.method,
    path,
    route.query,
    route.req_body,
    route.res_body
  );
}
function with_query(route, query) {
  return new Route(
    route.method,
    route.path,
    query,
    route.req_body,
    route.res_body
  );
}
function with_request_body(route, req_body) {
  return new Route(
    route.method,
    route.path,
    route.query,
    req_body,
    route.res_body
  );
}
function with_response_body(route, res_body) {
  return new Route(
    route.method,
    route.path,
    route.query,
    route.req_body,
    res_body
  );
}

// build/dev/javascript/glitr_lustre/glitr/lustre.mjs
var RequestFactory = class extends CustomType {
  constructor(scheme, host, port) {
    super();
    this.scheme = scheme;
    this.host = host;
    this.port = port;
  }
};
var RouteRequest = class extends CustomType {
  constructor(route, scheme, host, port, path_opt, query_opt, body_opt) {
    super();
    this.route = route;
    this.scheme = scheme;
    this.host = host;
    this.port = port;
    this.path_opt = path_opt;
    this.query_opt = query_opt;
    this.body_opt = body_opt;
  }
};
function create_factory() {
  return new RequestFactory(new Http(), "localhost", 80);
}
function with_scheme(factory2, scheme) {
  if (scheme instanceof Http) {
    return new RequestFactory(new Http(), factory2.host, 80);
  } else {
    return new RequestFactory(new Https(), factory2.host, 443);
  }
}
function with_host(factory2, host) {
  return factory2.withFields({ host });
}
function with_port(factory2, port) {
  return factory2.withFields({ port });
}
function for_route(factory2, route) {
  return new RouteRequest(
    route,
    factory2.scheme,
    factory2.host,
    factory2.port,
    new None(),
    new None(),
    new None()
  );
}
function with_path2(request, path) {
  return request.withFields({ path_opt: new Some(path) });
}
function with_query2(request, query) {
  return request.withFields({ query_opt: new Some(query) });
}
function with_body(request, body2) {
  return request.withFields({ body_opt: new Some(body2) });
}
function add_path(req, rreq, on_error, then$2) {
  let $ = (() => {
    let _pipe = rreq.route.path;
    return get_type3(_pipe);
  })();
  let $1 = rreq.path_opt;
  if ($1 instanceof None) {
    return on_error("Path option is missing, please call with_path before send");
  } else {
    let path = $1[0];
    return then$2(
      (() => {
        let _pipe = req;
        return set_path(
          _pipe,
          (() => {
            let _pipe$1 = rreq.route.path;
            let _pipe$2 = encode3(_pipe$1, path);
            return join2(_pipe$2, "/");
          })()
        );
      })()
    );
  }
}
function add_query(req, rreq, on_error, then$2) {
  let $ = (() => {
    let _pipe = rreq.route.query;
    return get_type4(_pipe);
  })();
  let $1 = rreq.query_opt;
  if ($ instanceof ComplexQuery && $1 instanceof None) {
    return on_error(
      "Query option is missing, please call with_query before send"
    );
  } else if ($ instanceof EmptyQuery) {
    return then$2(req);
  } else {
    let query = $1[0];
    return then$2(
      (() => {
        let _pipe = req;
        return set_query(
          _pipe,
          (() => {
            let _pipe$1 = rreq.route.query;
            return encode4(_pipe$1, query);
          })()
        );
      })()
    );
  }
}
function add_body(req, rreq, on_error, then$2) {
  let $ = (() => {
    let _pipe = rreq.route.req_body;
    return get_type2(_pipe);
  })();
  let $1 = rreq.body_opt;
  if ($ instanceof JsonBody && $1 instanceof None) {
    return on_error("Body option is missing, please call with_body before send");
  } else if ($ instanceof StringBody && $1 instanceof None) {
    return on_error("Body option is missing, please call with_body before send");
  } else if ($ instanceof EmptyBody) {
    return then$2(req);
  } else if ($ instanceof JsonBody && $1 instanceof Some) {
    let body2 = $1[0];
    return then$2(
      (() => {
        let _pipe = req;
        let _pipe$1 = set_body(
          _pipe,
          (() => {
            let _pipe$12 = rreq.route.req_body;
            let _pipe$2 = encode2(_pipe$12, body2);
            return to_string3(_pipe$2);
          })()
        );
        return set_header(_pipe$1, "Content-Type", "application/json");
      })()
    );
  } else {
    let body2 = $1[0];
    return then$2(
      (() => {
        let _pipe = req;
        return set_body(
          _pipe,
          (() => {
            let _pipe$1 = rreq.route.req_body;
            let _pipe$2 = encode2(_pipe$1, body2);
            return to_string3(_pipe$2);
          })()
        );
      })()
    );
  }
}
function glitr_to_http_error(err) {
  if (err instanceof RouteError) {
    let msg = err.msg;
    return new OtherError(500, msg);
  } else {
    let json_err = err.err;
    return new JsonError(json_err);
  }
}
function send3(rreq, as_msg, on_error) {
  let req = (() => {
    let _pipe = new$4();
    return set_method(_pipe, rreq.route.method);
  })();
  return add_path(
    req,
    rreq,
    on_error,
    (req2) => {
      return add_query(
        req2,
        rreq,
        on_error,
        (req3) => {
          return add_body(
            req3,
            rreq,
            on_error,
            (req4) => {
              let req$1 = (() => {
                let _pipe2 = req4;
                let _pipe$1 = set_scheme(_pipe2, rreq.scheme);
                let _pipe$2 = set_host(_pipe$1, rreq.host);
                return set_port(_pipe$2, rreq.port);
              })();
              let _pipe = req$1;
              return send2(
                _pipe,
                expect_text(
                  (body2) => {
                    let _pipe$1 = body2;
                    let _pipe$2 = then$(
                      _pipe$1,
                      (value3) => {
                        let _pipe$22 = rreq.route.res_body;
                        let _pipe$3 = decode4(_pipe$22, value3);
                        return map_error(_pipe$3, glitr_to_http_error);
                      }
                    );
                    return as_msg(_pipe$2);
                  }
                )
              );
            }
          );
        }
      );
    }
  );
}

// build/dev/javascript/client/modal_dialog_ffi.mjs
function showModal(element2) {
  if (!element2 || !(element2 instanceof HTMLDialogElement))
    return;
  element2.showModal();
}
function closeModal(element2) {
  if (!element2 || !(element2 instanceof HTMLDialogElement))
    return;
  element2.close();
}

// build/dev/javascript/client/utils.mjs
function send_and_handle_errors(req, on_success) {
  let _pipe = req;
  return send3(
    _pipe,
    (res) => {
      if (res.isOk()) {
        let ok = res[0];
        return on_success(ok);
      } else {
        let err = res[0];
        return new ServerError(err);
      }
    },
    (msg) => {
      return from(
        (dispatch) => {
          return dispatch(new ClientError(msg));
        }
      );
    }
  );
}
function guard2(result, return$, otherwise) {
  if (result.isOk()) {
    let value3 = result[0];
    return otherwise(value3);
  } else {
    return return$;
  }
}

// build/dev/javascript/client/client/components/navigation_bar.mjs
function playlist_link(p2) {
  return a(
    toList([
      class$(
        "text-center font-bold bg-zinc-800 hover:bg-zinc-700/50 rounded-md py-2 px-4"
      ),
      href("/playlists/" + p2.id)
    ]),
    toList([text2(p2.name)])
  );
}
function on_submit(ev) {
  prevent_default(ev);
  let search4 = getElementById("search-songs-2");
  return guard2(
    search4,
    new Ok(new ClientError("Can't find an element with ID search-songs-2")),
    (el) => {
      return guard2(
        (() => {
          let _pipe = el;
          return value2(_pipe);
        })(),
        new Ok(new ClientError("Can't get value from search input")),
        (value3) => {
          return new Ok(new SongEvent(new SearchSongs(value3)));
        }
      );
    }
  );
}
function view2(playlists) {
  return toList([
    div(
      toList([class$("p-2 flex flex-col gap-2 items-stretch")]),
      toList([
        h2(
          toList([class$("text-center font-bold text-3xl")]),
          toList([text2("Playlist Maker")])
        ),
        form(
          toList([
            on2("submit", on_submit),
            class$(
              "rounded-md bg-zinc-800 hover:bg-zinc-700/50 opacity-50 hover:opacity-100 flex mb-4 items-center"
            )
          ]),
          toList([
            img(
              toList([
                src("/search.svg"),
                class$("w-4 h-4 mx-2")
              ])
            ),
            input(
              toList([
                class$(
                  "py-2 px-4 bg-zinc-700/30 hover:bg-zinc-700/70 focus:bg-zinc-600/80 grow"
                ),
                id("search-songs-2"),
                placeholder("Search")
              ])
            )
          ])
        ),
        keyed(
          (_capture) => {
            return div(
              toList([class$("flex flex-col items-stretch")]),
              _capture
            );
          },
          map2(
            playlists,
            (p2) => {
              let child = playlist_link(p2[1]);
              return [p2[0], child];
            }
          )
        ),
        button(
          toList([
            class$(
              "text-center font-bold bg-zinc-800 hover:bg-zinc-700/50 rounded-md py-2 px-4"
            ),
            on2(
              "click",
              (_) => {
                return new Ok(new OpenDialog("create-playlist"));
              }
            )
          ]),
          toList([text2("+ Create playlist")])
        )
      ])
    ),
    view()
  ]);
}

// build/dev/javascript/glitr_convert/glitr/convert/json.mjs
function encode_value(val) {
  if (val instanceof StringValue) {
    let v = val.value;
    return string3(v);
  } else if (val instanceof BoolValue) {
    let v = val.value;
    return bool2(v);
  } else if (val instanceof FloatValue) {
    let v = val.value;
    return float2(v);
  } else if (val instanceof IntValue) {
    let v = val.value;
    return int2(v);
  } else if (val instanceof ListValue) {
    let vals = val.value;
    return array2(vals, encode_value);
  } else if (val instanceof DictValue) {
    let v = val.value;
    return array2(
      (() => {
        let _pipe = v;
        return map_to_list(_pipe);
      })(),
      (keyval) => {
        return array2(toList([keyval[0], keyval[1]]), encode_value);
      }
    );
  } else if (val instanceof ObjectValue) {
    let v = val.value;
    return object2(
      map2(v, (f) => {
        return [f[0], encode_value(f[1])];
      })
    );
  } else if (val instanceof OptionalValue) {
    let v = val.value;
    return nullable(v, encode_value);
  } else if (val instanceof ResultValue) {
    let v = val.value;
    if (v.isOk()) {
      let res = v[0];
      return object2(
        toList([["type", string3("ok")], ["value", encode_value(res)]])
      );
    } else {
      let err = v[0];
      return object2(
        toList([["type", string3("error")], ["value", encode_value(err)]])
      );
    }
  } else if (val instanceof EnumValue) {
    let variant = val.variant;
    let v = val.value;
    return object2(
      toList([["variant", string3(variant)], ["value", encode_value(v)]])
    );
  } else {
    return null$();
  }
}
function json_encode(value3, converter) {
  let _pipe = value3;
  let _pipe$1 = encode(converter)(_pipe);
  return encode_value(_pipe$1);
}
function decode_value(of) {
  if (of instanceof String2) {
    return (val) => {
      let _pipe = val;
      let _pipe$1 = string2(_pipe);
      return map3(
        _pipe$1,
        (var0) => {
          return new StringValue(var0);
        }
      );
    };
  } else if (of instanceof Bool) {
    return (val) => {
      let _pipe = val;
      let _pipe$1 = bool(_pipe);
      return map3(_pipe$1, (var0) => {
        return new BoolValue(var0);
      });
    };
  } else if (of instanceof Float) {
    return (val) => {
      let _pipe = val;
      let _pipe$1 = float(_pipe);
      return map3(_pipe$1, (var0) => {
        return new FloatValue(var0);
      });
    };
  } else if (of instanceof Int) {
    return (val) => {
      let _pipe = val;
      let _pipe$1 = int(_pipe);
      return map3(_pipe$1, (var0) => {
        return new IntValue(var0);
      });
    };
  } else if (of instanceof List2) {
    let el = of.of;
    return (val) => {
      let _pipe = val;
      let _pipe$1 = list(dynamic)(_pipe);
      let _pipe$2 = then$(
        _pipe$1,
        (val_list) => {
          return fold(
            val_list,
            new Ok(toList([])),
            (result, list_el) => {
              let $ = (() => {
                let _pipe$22 = list_el;
                return decode_value(el)(_pipe$22);
              })();
              if (result.isOk() && $.isOk()) {
                let result_list = result[0];
                let jval = $[0];
                return new Ok(prepend(jval, result_list));
              } else if (result.isOk() && !$.isOk()) {
                let errs = $[0];
                return new Error(errs);
              } else if (!result.isOk() && $.isOk()) {
                let errs = result[0];
                return new Error(errs);
              } else {
                let errs = result[0];
                let new_errs = $[0];
                return new Error(append(errs, new_errs));
              }
            }
          );
        }
      );
      let _pipe$3 = map3(_pipe$2, reverse);
      return map3(_pipe$3, (var0) => {
        return new ListValue(var0);
      });
    };
  } else if (of instanceof Dict2) {
    let k = of.key;
    let v = of.value;
    return (val) => {
      let _pipe = val;
      let _pipe$1 = list(
        list(any(toList([decode_value(k), decode_value(v)])))
      )(_pipe);
      let _pipe$2 = then$(
        _pipe$1,
        (_capture) => {
          return fold(
            _capture,
            new Ok(toList([])),
            (result, el) => {
              if (result.isOk() && el.atLeastLength(2)) {
                let vals = result[0];
                let first3 = el.head;
                let second2 = el.tail.head;
                return new Ok(prepend([first3, second2], vals));
              } else if (result.isOk()) {
                return new Error(
                  toList([
                    new DecodeError("2 elements", "0 or 1", toList([]))
                  ])
                );
              } else if (!result.isOk() && el.atLeastLength(2)) {
                let errs = result[0];
                return new Error(errs);
              } else {
                let errs = result[0];
                return new Error(
                  prepend(
                    new DecodeError("2 elements", "0 or 1", toList([])),
                    errs
                  )
                );
              }
            }
          );
        }
      );
      let _pipe$3 = map3(_pipe$2, from_list);
      return map3(_pipe$3, (var0) => {
        return new DictValue(var0);
      });
    };
  } else if (of instanceof Object2) {
    let fields = of.fields;
    return (val) => {
      let _pipe = fold(
        fields,
        new Ok(toList([])),
        (result, f) => {
          let $ = (() => {
            let _pipe2 = val;
            return field(f[0], decode_value(f[1]))(_pipe2);
          })();
          if (result.isOk() && $.isOk()) {
            let field_list = result[0];
            let jval = $[0];
            return new Ok(prepend([f[0], jval], field_list));
          } else if (result.isOk() && !$.isOk()) {
            let errs = $[0];
            return new Error(errs);
          } else if (!result.isOk() && $.isOk()) {
            let errs = result[0];
            return new Error(errs);
          } else {
            let errs = result[0];
            let new_errs = $[0];
            return new Error(append(errs, new_errs));
          }
        }
      );
      let _pipe$1 = map3(_pipe, reverse);
      return map3(
        _pipe$1,
        (var0) => {
          return new ObjectValue(var0);
        }
      );
    };
  } else if (of instanceof Optional) {
    let of$1 = of.of;
    return (val) => {
      let _pipe = val;
      let _pipe$1 = optional(decode_value(of$1))(_pipe);
      return map3(
        _pipe$1,
        (var0) => {
          return new OptionalValue(var0);
        }
      );
    };
  } else if (of instanceof Result2) {
    let res = of.result;
    let err = of.error;
    return (val) => {
      return try$(
        (() => {
          let _pipe = val;
          return field("type", string2)(_pipe);
        })(),
        (type_val) => {
          if (type_val === "ok") {
            let _pipe = val;
            let _pipe$1 = field("value", decode_value(res))(_pipe);
            let _pipe$2 = map3(
              _pipe$1,
              (var0) => {
                return new Ok(var0);
              }
            );
            return map3(
              _pipe$2,
              (var0) => {
                return new ResultValue(var0);
              }
            );
          } else if (type_val === "error") {
            let _pipe = val;
            let _pipe$1 = field("value", decode_value(err))(_pipe);
            let _pipe$2 = map3(
              _pipe$1,
              (var0) => {
                return new Error(var0);
              }
            );
            return map3(
              _pipe$2,
              (var0) => {
                return new ResultValue(var0);
              }
            );
          } else {
            let other = type_val;
            return new Error(
              toList([
                new DecodeError(
                  "'ok' or 'error'",
                  other,
                  toList(["type"])
                )
              ])
            );
          }
        }
      );
    };
  } else if (of instanceof Enum) {
    let variants = of.variants;
    return (val) => {
      return try$(
        (() => {
          let _pipe = val;
          return field("variant", string2)(_pipe);
        })(),
        (variant_name) => {
          return try$(
            (() => {
              let _pipe = key_find(variants, variant_name);
              return replace_error(
                _pipe,
                toList([
                  new DecodeError(
                    "One of: " + (() => {
                      let _pipe$1 = variants;
                      let _pipe$2 = map2(_pipe$1, (v) => {
                        return v[0];
                      });
                      return join2(_pipe$2, "/");
                    })(),
                    variant_name,
                    toList(["variant"])
                  )
                ])
              );
            })(),
            (variant_def) => {
              return try$(
                (() => {
                  let _pipe = val;
                  let _pipe$1 = field("value", dynamic)(_pipe);
                  return then$(_pipe$1, decode_value(variant_def));
                })(),
                (variant_value) => {
                  return new Ok(new EnumValue(variant_name, variant_value));
                }
              );
            }
          );
        }
      );
    };
  } else {
    return (_) => {
      return new Ok(new NullValue());
    };
  }
}
function json_decode(converter) {
  return (value3) => {
    let _pipe = value3;
    let _pipe$1 = decode_value(type_def(converter))(_pipe);
    return then$(_pipe$1, decode3(converter));
  };
}

// build/dev/javascript/glitr/glitr/service.mjs
var RouteService = class extends CustomType {
  constructor(root_path, base, upsert2) {
    super();
    this.root_path = root_path;
    this.base = base;
    this.upsert = upsert2;
  }
};
function nil_converter() {
  return [
    (_) => {
      return null$();
    },
    (_) => {
      return new Ok(void 0);
    }
  ];
}
function new$6() {
  return new RouteService(toList([]), nil_converter(), nil_converter());
}
function with_root_path(service, root_path) {
  return service.withFields({ root_path });
}
function with_base_converter(service, converter) {
  return new RouteService(
    service.root_path,
    [
      (val) => {
        let _pipe = val;
        return json_encode(_pipe, converter);
      },
      json_decode(converter)
    ],
    service.upsert
  );
}
function with_upsert_converter(service, converter) {
  return new RouteService(
    service.root_path,
    service.base,
    [
      (val) => {
        let _pipe = val;
        return json_encode(_pipe, converter);
      },
      json_decode(converter)
    ]
  );
}
function create_route(service) {
  let _pipe = new$5();
  let _pipe$1 = with_method(_pipe, new Post());
  let _pipe$2 = with_path(_pipe$1, static_path(service.root_path));
  let _pipe$3 = with_request_body(
    _pipe$2,
    json_body(service.upsert[0], service.upsert[1])
  );
  return with_response_body(
    _pipe$3,
    json_body(service.base[0], service.base[1])
  );
}
function get_all_route(service) {
  let _pipe = new$5();
  let _pipe$1 = with_method(_pipe, new Get());
  let _pipe$2 = with_path(_pipe$1, static_path(service.root_path));
  return with_response_body(
    _pipe$2,
    json_body(
      (v) => {
        let _pipe$3 = v;
        return array2(_pipe$3, service.base[0]);
      },
      list(service.base[1])
    )
  );
}
function update_route(service) {
  let _pipe = new$5();
  let _pipe$1 = with_method(_pipe, new Post());
  let _pipe$2 = with_path(_pipe$1, id_path(service.root_path));
  let _pipe$3 = with_request_body(
    _pipe$2,
    json_body(service.upsert[0], service.upsert[1])
  );
  return with_response_body(
    _pipe$3,
    json_body(service.base[0], service.base[1])
  );
}
function delete_route(service) {
  let _pipe = new$5();
  let _pipe$1 = with_method(_pipe, new Delete());
  let _pipe$2 = with_path(_pipe$1, id_path(service.root_path));
  return with_response_body(
    _pipe$2,
    json_body(string3, string2)
  );
}

// build/dev/javascript/shared/shared/routes/playlist_routes.mjs
function playlist_service() {
  let _pipe = new$6();
  let _pipe$1 = with_root_path(_pipe, toList(["api", "playlists"]));
  let _pipe$2 = with_base_converter(
    _pipe$1,
    playlist_converter()
  );
  return with_upsert_converter(
    _pipe$2,
    upsert_playlist_converter()
  );
}
function get_all() {
  let _pipe = playlist_service();
  return get_all_route(_pipe);
}
function create() {
  let _pipe = playlist_service();
  return create_route(_pipe);
}
function update() {
  let _pipe = playlist_service();
  return update_route(_pipe);
}
function delete$2() {
  let _pipe = playlist_service();
  return delete_route(_pipe);
}

// build/dev/javascript/client/client/services/factory.mjs
function factory() {
  let _pipe = create_factory();
  let _pipe$1 = with_scheme(_pipe, new Http());
  let _pipe$2 = with_host(_pipe$1, "localhost");
  return with_port(_pipe$2, 2345);
}

// build/dev/javascript/client/client/services/playlist_service.mjs
function get_all2() {
  let _pipe = factory();
  let _pipe$1 = for_route(_pipe, get_all());
  let _pipe$2 = with_path2(_pipe$1, void 0);
  return send_and_handle_errors(
    _pipe$2,
    (d) => {
      return new PlaylistEvent(new ServerSentPlaylists(d));
    }
  );
}
function create2(name) {
  let _pipe = factory();
  let _pipe$1 = for_route(_pipe, create());
  let _pipe$2 = with_path2(_pipe$1, void 0);
  let _pipe$3 = with_body(_pipe$2, new UpsertPlaylist(name));
  return send_and_handle_errors(
    _pipe$3,
    (d) => {
      return new PlaylistEvent(
        new ServerCreatedPlaylist(d)
      );
    }
  );
}
function update2(id2, name) {
  let _pipe = factory();
  let _pipe$1 = for_route(_pipe, update());
  let _pipe$2 = with_path2(_pipe$1, id2);
  let _pipe$3 = with_body(_pipe$2, new UpsertPlaylist(name));
  return send_and_handle_errors(
    _pipe$3,
    (d) => {
      return new PlaylistEvent(
        new ServerUpdatedPlaylist(d)
      );
    }
  );
}
function delete$3(id2) {
  let _pipe = factory();
  let _pipe$1 = for_route(_pipe, delete$2());
  let _pipe$2 = with_path2(_pipe$1, id2);
  return send_and_handle_errors(
    _pipe$2,
    (d) => {
      return new PlaylistEvent(
        new ServerDeletedPlaylist(d)
      );
    }
  );
}

// build/dev/javascript/client/client/types/model.mjs
var Model2 = class extends CustomType {
  constructor(route, token, playlists) {
    super();
    this.route = route;
    this.token = token;
    this.playlists = playlists;
  }
};

// build/dev/javascript/client/client/events/playlist_event_handler.mjs
function on_playlist_event(model, event2) {
  if (event2 instanceof CreatePlaylist) {
    let name = event2.name;
    return [model, create2(name)];
  } else if (event2 instanceof UpdatePlaylist) {
    let id2 = event2.id;
    let name = event2.name;
    return [model, update2(id2, name)];
  } else if (event2 instanceof DeletePlaylist) {
    let id2 = event2.id;
    return [model, delete$3(id2)];
  } else if (event2 instanceof ServerSentPlaylists) {
    let playlists = event2.playlists;
    return [
      model.withFields({
        playlists: from_list(
          (() => {
            let _pipe = playlists;
            return map2(_pipe, (p2) => {
              return [p2.id, p2];
            });
          })()
        )
      }),
      none()
    ];
  } else if (event2 instanceof ServerCreatedPlaylist) {
    let p2 = event2.playlist;
    return [
      model.withFields({
        playlists: (() => {
          let _pipe = model.playlists;
          return insert(_pipe, p2.id, p2);
        })()
      }),
      from(
        (dispatch) => {
          return dispatch(new CloseDialog("create-playlist"));
        }
      )
    ];
  } else if (event2 instanceof ServerUpdatedPlaylist) {
    let p2 = event2.playlist;
    return [
      model.withFields({
        playlists: (() => {
          let _pipe = model.playlists;
          return insert(_pipe, p2.id, p2);
        })()
      }),
      (() => {
        let _pipe = parse2(location());
        let _pipe$1 = map3(_pipe, load);
        return unwrap2(_pipe$1, none());
      })()
    ];
  } else if (event2 instanceof ServerSentPlaylist) {
    let p2 = event2.playlist;
    return [
      model.withFields({
        playlists: (() => {
          let _pipe = model.playlists;
          return insert(_pipe, p2.id, p2);
        })()
      }),
      (() => {
        let _pipe = parse2(location());
        let _pipe$1 = map3(_pipe, load);
        return unwrap2(_pipe$1, none());
      })()
    ];
  } else {
    let id2 = event2.id;
    return [
      model.withFields({
        playlists: (() => {
          let _pipe = model.playlists;
          return drop2(_pipe, toList([id2]));
        })()
      }),
      push("/", new None(), new None())
    ];
  }
}

// build/dev/javascript/plinth/audio_ffi.mjs
function newAudio(url) {
  return new Audio(url);
}
async function play(audio) {
  try {
    await audio.play();
    return new Ok();
  } catch (error2) {
    return new Error(error2.toString());
  }
}

// build/dev/javascript/shared/shared/routes/song_routes.mjs
var SearchQuery = class extends CustomType {
  constructor(search4, token) {
    super();
    this.search = search4;
    this.token = token;
  }
};
function search_encoder(query) {
  return toList([["q", query.search], ["token", query.token]]);
}
function search_decoder(value3) {
  return try$(
    key_find(value3, "q"),
    (search4) => {
      return try$(
        key_find(value3, "token"),
        (token) => {
          return new Ok(new SearchQuery(search4, token));
        }
      );
    }
  );
}
function search() {
  let _pipe = new$5();
  let _pipe$1 = with_method(_pipe, new Get());
  let _pipe$2 = with_path(
    _pipe$1,
    static_path(toList(["api", "songs", "search"]))
  );
  let _pipe$3 = with_query(
    _pipe$2,
    complex_query(
      new QueryConverter(search_encoder, search_decoder)
    )
  );
  return with_response_body(
    _pipe$3,
    json_body(
      (_capture) => {
        return json_encode(
          _capture,
          list2(song_converter())
        );
      },
      json_decode(list2(song_converter()))
    )
  );
}

// build/dev/javascript/client/client/services/song_service.mjs
function search2(q, token) {
  let _pipe = factory();
  let _pipe$1 = for_route(_pipe, search());
  let _pipe$2 = with_path2(_pipe$1, void 0);
  let _pipe$3 = with_query2(_pipe$2, new SearchQuery(q, token));
  return send3(
    _pipe$3,
    (res) => {
      if (res.isOk()) {
        let songs = res[0];
        return new SongEvent(new ServerSentSongs(songs));
      } else {
        let err = res[0];
        return new ServerError(err);
      }
    },
    (msg) => {
      return from(
        (dispatch) => {
          return dispatch(new ClientError(msg));
        }
      );
    }
  );
}

// build/dev/javascript/client/client/events/song_event_handler.mjs
function on_song_event(model, event2) {
  if (event2 instanceof SearchSongs) {
    let q = event2.search;
    return [
      model.withFields({ route: new Search(true, toList([])) }),
      search2(q, model.token)
    ];
  } else if (event2 instanceof ServerSentSongs) {
    let songs = event2.results;
    return [
      model.withFields({ route: new Search(false, songs) }),
      none()
    ];
  } else {
    let url = event2.preview_url;
    return [
      model,
      from(
        (_) => {
          let _pipe = newAudio(url);
          play(_pipe);
          return void 0;
        }
      )
    ];
  }
}

// build/dev/javascript/client/client/views/home.mjs
function view3() {
  return toList([
    h3(
      toList([class$("text-lg mb-4 text-center")]),
      toList([text2("Search songs and create playlists")])
    ),
    p(
      toList([class$("mb-4 text-center")]),
      toList([
        text2(
          "Start by creating a playlist or searching songs by clicking on the corresponding buttons on the left"
        )
      ])
    )
  ]);
}

// build/dev/javascript/client/client/views/login.mjs
function view4() {
  return toList([
    h3(
      toList([class$("text-lg mb-4 text-center")]),
      toList([text2("Search songs and create playlists")])
    ),
    a(
      toList([
        href("/login"),
        class$(
          "text-green-400 bg-zinc-700 hover:bg-zinc-600 rounded-md font-bold flex gap-2 py-2 px-4"
        )
      ]),
      toList([
        img(
          toList([
            src(
              "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png"
            ),
            class$("h-6")
          ])
        ),
        text2("Login to Spotify")
      ])
    )
  ]);
}

// build/dev/javascript/client/client/views/not_found.mjs
function view5() {
  return toList([
    h3(
      toList([class$("text-lg my-20 text-center")]),
      toList([
        text2("The content you were looking for couldn't be found...")
      ])
    )
  ]);
}

// build/dev/javascript/client/client/components/playlist_songs/song_row.mjs
function album_cover(song) {
  return div(
    toList([]),
    toList([
      img(
        toList([
          src(song.album_cover),
          class$("w-16 h-16 rounded-sm")
        ])
      )
    ])
  );
}
function view6(song) {
  return div(
    toList([
      class$(
        "flex items-center gap-4 py-4 px-8 bg-zinc-700/50 hover:bg-zinc-700/80"
      )
    ]),
    toList([
      album_cover(song),
      div(
        toList([class$("flex flex-col flex-1")]),
        toList([
          span(
            toList([class$("font-semibold")]),
            toList([text2(song.title)])
          ),
          span(
            toList([class$("text-sm text-zinc-100/70")]),
            toList([
              text2(
                (() => {
                  let _pipe = song.artists;
                  return join2(_pipe, " - ");
                })()
              )
            ])
          ),
          span(
            toList([class$("text-sm text-zinc-100/70")]),
            toList([text2(song.album)])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/client/client/components/playlist_songs/song_list.mjs
function view7(results) {
  return keyed(
    (_capture) => {
      return ul(
        toList([class$("rounded-lg overflow-clip mt-8 w-full")]),
        _capture
      );
    },
    map2(
      results,
      (song) => {
        let child = li(toList([]), toList([view6(song)]));
        return [song.id, child];
      }
    )
  );
}

// build/dev/javascript/client/client/components/playlists/update_playlist.mjs
function on_update(_, id2) {
  let element2 = getElementById("update-playlist-name");
  if (!element2.isOk()) {
    return new Ok(
      new ClientError("Couldn't find element with id update-playlist-name")
    );
  } else {
    let el = element2[0];
    let value3 = (() => {
      let _pipe = el;
      return value2(_pipe);
    })();
    if (!value3.isOk()) {
      return new Ok(new ClientError("Couldn't get value of element"));
    } else {
      let name = value3[0];
      return new Ok(
        new PlaylistEvent(new UpdatePlaylist(id2, name))
      );
    }
  }
}
function view8(p2) {
  return dialog(
    toList([
      id("update-playlist"),
      class$(
        "p-4 rounded-lg backdrop:bg-zinc-900 backdrop:opacity-80"
      )
    ]),
    toList([
      h1(
        toList([class$("text-2xl font-bold mb-4")]),
        toList([text2("Update a playlist " + p2.name)])
      ),
      div(
        toList([class$("flex flex-col gap-4")]),
        toList([
          label(
            toList([class$("flex gap-2 items-center")]),
            toList([
              span(toList([]), toList([text2("Playlist name")])),
              input(
                toList([
                  id("update-playlist-name"),
                  placeholder("Playlist name..."),
                  class$(
                    "p-2 rounded-md bg-zinc-100 focus:bg-zinc-200"
                  ),
                  value(p2.name)
                ])
              )
            ])
          ),
          div(
            toList([class$("flex justify-end")]),
            toList([
              button(
                toList([
                  class$("p-2 bg-zinc-100"),
                  on2(
                    "click",
                    (_) => {
                      return new Ok(new CloseDialog("update-playlist"));
                    }
                  )
                ]),
                toList([text2("Close")])
              ),
              button(
                toList([
                  class$("p-2 bg-green-500 text-zinc-100"),
                  on2(
                    "click",
                    (_capture) => {
                      return on_update(_capture, p2.id);
                    }
                  )
                ]),
                toList([text2("Save")])
              )
            ])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/client/client/views/playlist_page.mjs
function edit_button() {
  return button(
    toList([
      class$("py-2 px-4 bg-cyan-600 hover:bg-cyan-500/50 rounded-md"),
      on_click(new OpenDialog("update-playlist"))
    ]),
    toList([text2("Edit")])
  );
}
function delete_button(p2) {
  return button(
    toList([
      class$("py-2 px-4 bg-red-600 hover:bg-red-500/50 rounded-md"),
      on_click(
        new PlaylistEvent(new DeletePlaylist(p2.id))
      )
    ]),
    toList([text2("Delete")])
  );
}
function view9(p2) {
  return toList([
    h3(
      toList([class$("text-lg mb-4 text-center")]),
      toList([text2(p2.name)])
    ),
    div(
      toList([class$("flex gap-4 mb-4")]),
      toList([edit_button(), delete_button(p2)])
    ),
    view7(p2.songs),
    view8(p2)
  ]);
}

// build/dev/javascript/client/client/components/songs/song_row.mjs
function album_cover2(song) {
  let $ = song.preview_url;
  if ($ instanceof Some) {
    let url = $[0];
    return div(
      toList([class$("group relative")]),
      toList([
        img(
          toList([
            src(song.album_cover),
            class$("w-16 h-16 rounded-sm"),
            on2(
              "click",
              (_) => {
                return new Ok(
                  new SongEvent(new PlayPreview(url))
                );
              }
            )
          ])
        ),
        div(
          toList([
            class$(
              "absolute w-full h-full top-0 left-0 group-hover:opacity-100 bg-zinc-100/50 text-zinc-800 p-2 opacity-0 transition-opacity duration-300 pointer-events-none"
            )
          ]),
          toList([img(toList([src("./play-circle.svg")]))])
        )
      ])
    );
  } else {
    return div(
      toList([]),
      toList([
        img(
          toList([
            src(song.album_cover),
            class$("w-16 h-16 rounded-sm")
          ])
        )
      ])
    );
  }
}
function view10(song) {
  return div(
    toList([
      class$(
        "flex items-center gap-4 py-4 px-8 bg-zinc-700/50 hover:bg-zinc-700/80"
      )
    ]),
    toList([
      album_cover2(song),
      div(
        toList([class$("flex flex-col flex-1")]),
        toList([
          span(
            toList([class$("font-semibold")]),
            toList([text2(song.title)])
          ),
          span(
            toList([class$("text-sm text-zinc-100/70")]),
            toList([
              text2(
                (() => {
                  let _pipe = song.artists;
                  return join2(_pipe, " - ");
                })()
              )
            ])
          ),
          span(
            toList([class$("text-sm text-zinc-100/70")]),
            toList([text2(song.album)])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/client/client/components/songs/song_list.mjs
function view11(results) {
  return keyed(
    (_capture) => {
      return ul(
        toList([class$("rounded-lg overflow-clip mt-8 w-full")]),
        _capture
      );
    },
    map2(
      results,
      (song) => {
        let child = li(toList([]), toList([view10(song)]));
        return [song.id, child];
      }
    )
  );
}

// build/dev/javascript/client/client/components/spinner.mjs
function spinner() {
  return div(
    toList([
      class$(
        "mt-8 w-8 h-8 animate-spin rounded-full border-2 border-t-zinc-100 border-x-zinc-100/50 border-b-zinc-100/50"
      )
    ]),
    toList([])
  );
}

// build/dev/javascript/client/client/views/search.mjs
function search3(searching, results) {
  return toList([
    p(
      toList([class$("text-xl font-black mb-4")]),
      toList([text2("Results :")])
    ),
    (() => {
      if (searching) {
        return spinner();
      } else {
        return view11(results);
      }
    })()
  ]);
}

// build/dev/javascript/client/router.mjs
function map_route(uri) {
  let $ = path_segments(uri.path);
  if ($.hasLength(0)) {
    return new Home();
  } else if ($.hasLength(1) && $.head === "search") {
    return new Search(false, toList([]));
  } else if ($.hasLength(2) && $.head === "playlists") {
    let id2 = $.tail.head;
    return new Playlist2(id2);
  } else {
    return new Login();
  }
}

// build/dev/javascript/client/client.mjs
function init3(_) {
  let $ = parse2(location());
  if (!$.isOk()) {
    throw makeError(
      "let_assert",
      "client",
      41,
      "init",
      "Pattern match failed, no pattern matched the value.",
      { value: $ }
    );
  }
  let uri = $[0];
  let token = (() => {
    let _pipe = uri;
    let _pipe$1 = ((uri2) => {
      return parse_query2(
        (() => {
          let _pipe$12 = uri2.query;
          return unwrap(_pipe$12, "");
        })()
      );
    })(_pipe);
    let _pipe$2 = then$(
      _pipe$1,
      (q) => {
        let _pipe$22 = q;
        return key_find(_pipe$22, "token");
      }
    );
    return unwrap2(_pipe$2, "");
  })();
  return [
    new Model2(
      (() => {
        let _pipe = uri;
        return map_route(_pipe);
      })(),
      token,
      new$()
    ),
    batch(
      toList([
        init2(
          (uri2) => {
            let _pipe = uri2;
            let _pipe$1 = map_route(_pipe);
            return new OnRouteChange(_pipe$1);
          }
        ),
        get_all2()
      ])
    )
  ];
}
function update3(model, msg) {
  if (msg instanceof SongEvent) {
    let ev = msg.ev;
    return on_song_event(model, ev);
  } else if (msg instanceof PlaylistEvent) {
    let ev = msg.ev;
    return on_playlist_event(model, ev);
  } else if (msg instanceof OpenDialog) {
    let id2 = msg.id;
    return [
      model,
      from(
        (_) => {
          let _pipe = getElementById(id2);
          let _pipe$1 = map3(_pipe, showModal);
          return unwrap2(_pipe$1, void 0);
        }
      )
    ];
  } else if (msg instanceof CloseDialog) {
    let id2 = msg.id;
    return [
      model,
      from(
        (_) => {
          let _pipe = getElementById(id2);
          let _pipe$1 = map3(_pipe, closeModal);
          return unwrap2(_pipe$1, void 0);
        }
      )
    ];
  } else if (msg instanceof ClientError) {
    let err = msg.message;
    return [model, from((_) => {
      return error(err);
    })];
  } else if (msg instanceof ServerError) {
    let err = msg.error;
    return [model, from((_) => {
      return error(err);
    })];
  } else if (msg instanceof OnRouteChange && msg.route instanceof Login) {
    return [
      model,
      (() => {
        let _pipe = parse2("login");
        let _pipe$1 = map3(
          _pipe,
          (_capture) => {
            return load(_capture);
          }
        );
        return unwrap2(_pipe$1, none());
      })()
    ];
  } else {
    let route = msg.route;
    return [model.withFields({ route }), none()];
  }
}
function view12(model) {
  let children2 = (() => {
    let $ = model.token;
    let $1 = model.route;
    if ($ === "" && $1 instanceof Home) {
      return view4();
    } else if ($ === "" && $1 instanceof Search) {
      return view4();
    } else if ($1 instanceof Home) {
      return view3();
    } else if ($1 instanceof Search) {
      let searching = $1.searching;
      let songs = $1.results;
      return search3(searching, songs);
    } else if ($1 instanceof Playlist2) {
      let id2 = $1.id;
      let _pipe = model.playlists;
      let _pipe$1 = get(_pipe, id2);
      let _pipe$2 = map3(_pipe$1, view9);
      return unwrap2(_pipe$2, view5());
    } else {
      return view5();
    }
  })();
  let left_children = view2(
    (() => {
      let _pipe = model.playlists;
      return map_to_list(_pipe);
    })()
  );
  return layout(children2, left_children);
}
function main() {
  let app = application(init3, update3, view12);
  let $ = start2(app, "#app", void 0);
  if (!$.isOk()) {
    throw makeError(
      "let_assert",
      "client",
      33,
      "main",
      "Pattern match failed, no pattern matched the value.",
      { value: $ }
    );
  }
  return void 0;
}

// build/.lustre/entry.mjs
main();
