const {
  getStartEnd,
  getMarkerStartEnd
} = require("./Helpers");
const { Mark, Selection } = require("slate");
const { getPrettierCode } = require("../../webapi");

const KEY_PLUS = "=";
const KEY_MINUS = "-";
const KEY_BRACKET_END = "]";
const KEY_BRACKET_START = "[";
const MARK_TYPE = "curly";
const MARK_TYPE_ERR = "syntax_error";
const SPACE_REGEXP = /\s/;

function markSyntaxError(err, texts, state) {
  let errText, errTextIndex = 0;
  texts.find(node => {
    const nextIndex = errTextIndex + node.text.length + 1;
    if (nextIndex > err.pos) {
      errText = node;
      return true;
    }
    errTextIndex = nextIndex;
    return false;
  });
  if (!errText) {
    return;
  }
  return state
    .transform()
    .addMarkByKey(
      errText.key,
      err.pos - errTextIndex,
      1,
      Mark.create({ type: MARK_TYPE_ERR })
    );
}

function onSelect(e, data, state) {
  let { selection } = data;
  const startOffset = selection.startOffset;
  const startKey = selection.startKey;
  const texts = state.document.getTexts();

  let offset = 0;
  texts.forEach(node => {
    if (startKey === node.get("key")) {
      offset += startOffset;
      return false;
    } else {
      offset += node.text.length + 1; //+1 for \n
    }
  });

  let startEnd;
  try {
    startEnd = getStartEnd(texts.map(node => node.text).join("\n"), offset);
  } catch (err) {
    console.error(err);
    return markSyntaxError(err, texts, state).select(selection).apply();
  }

  let transform = state.transform(), doMark = false;
  const { start, end } = startEnd;
  const mark = Mark.create({ type: MARK_TYPE });
  offset = 0;

  texts.forEach(node => {
    const nextOffset = offset + node.text.length + 1; //+1 for \n

    // remove existing marks first
    transform = transform.removeMarkByKey(
      node.key,
      0,
      node.text.length,
      MARK_TYPE
    );
    transform = transform.removeMarkByKey(
      node.key,
      0,
      node.text.length,
      MARK_TYPE_ERR
    );

    if (offset <= start && start <= nextOffset) {
      let markLength = end - start;
      if (end > nextOffset) {
        doMark = true;
        markLength = nextOffset - start;
      }
      transform = transform.addMarkByKey(
        node.key,
        start - offset,
        markLength,
        mark
      );
    } else if (offset < end && end <= nextOffset) {
      transform = transform.addMarkByKey(node.key, 0, end - offset, mark);
      doMark = false;
    } else if (doMark) {
      transform = transform.addMarkByKey(node.key, 0, node.text.length, mark);
    }
    offset = nextOffset;
  });

  return transform.select(selection).apply();
}

function indexOf(str, char, idx) {
  for (let i = idx, len = str.length; i < len; i++) {
    if (str[i] === char) return i;
  }
  return idx;
}

function lastIndexOf(str, char, idx) {
  for (let i = idx; i >= 0; i--) {
    if (str[i] === char) return i;
  }
  return idx;
}

function startSelection(state) {
  const firstText = state.document.getFirstText();
  return Selection.create({
    anchorKey: firstText.key,
    anchorOffset: 0,
    focusKey: firstText.key,
    focusOffset: 0
  });
}

function onKeyDown(event, data, state, editor) {
  if (!data.isModAlt) {
    return;
  }

  if (data.key === KEY_PLUS) {
    const texts = state.document.getTexts();
    const { start, end } = getMarkerStartEnd(texts, MARK_TYPE);
    if (start === -1 || end <= start) {
      return;
    }
    const code = texts.map(node => node.text).join("\n");
    const newText = [
      code.substring(0, end),
      ",",
      code.substring(start, end),
      code.substring(end)
    ].join("");

    getPrettierCode(newText).then(res => {
      const nextStart = indexOf(res.text, code[start], end);
      editor.onChange(
        state
          .transform()
          .selectAll()
          .insertText(res.text)
          .select(startSelection(state))
          .moveOffsetsTo(nextStart + 1, nextStart + 1)
          .focus()
          .apply({ save: true })
      );
    });
  }

  if (data.key === KEY_MINUS) {
    const texts = state.document.getTexts();
    const { start, end } = getMarkerStartEnd(texts, MARK_TYPE);
    if (start === -1 || end <= start) {
      return;
    }
    const code = texts.map(node => node.text).join("\n");

    // swallow the previous comma if exist.
    let realStart = start;
    for (var i = start - 1; i > 0; i--) {
      if (!SPACE_REGEXP.test(code[i])) {
        if (code[i] === ",") realStart = i;
        break;
      }
    }

    const newText = [code.substring(0, realStart), code.substring(end)].join(
      ""
    );

    getPrettierCode(newText).then(res => {
      const prevEnd = lastIndexOf(res.text, code[realStart - 1], realStart - 1);
      editor.onChange(
        state
          .transform()
          .selectAll()
          .insertText(res.text)
          .select(startSelection(state))
          .moveOffsetsTo(prevEnd - 1, prevEnd - 1)
          .focus()
          .apply({ save: true })
      );
    });
  }

  if (data.key === KEY_BRACKET_END) {
    const startText = state.startText.text;
    const offset = state.selection.endOffset;
    const qq = startText.indexOf('"', offset);
    const nextq = startText.indexOf('"', qq + 1);
    if (qq === -1 || nextq === -1) {
      return;
    }
    return state.transform().moveOffsetsTo(qq + 1, nextq).apply();
  }

  if (data.key === KEY_BRACKET_START) {
    const startText = state.startText.text;
    const offset = state.selection.startOffset;
    const qq = startText.lastIndexOf('"', offset);
    const nextq = startText.lastIndexOf('"', qq - 1);
    if (qq === -1 || nextq === -1) {
      return;
    }
    console.log(startText.substring(qq, nextq));
    return state.transform().moveOffsetsTo(qq + 1, nextq).apply();
  }
}

function DataPlugin() {
  return {
    onSelect,
    onKeyDown: onKeyDown
  };
}

module.exports = DataPlugin;
