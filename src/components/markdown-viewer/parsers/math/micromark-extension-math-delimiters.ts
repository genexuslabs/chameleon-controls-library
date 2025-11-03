// micromark-extension-math.ts
import { Code, Effects, Extension, State } from "micromark-util-types";

/**
 * Token type augmentation for TypeScript.
 */
declare module "micromark-util-types" {
  interface TokenTypeMap {
    inlineMath: "inlineMath";
    inlineMathMarker: "inlineMathMarker";
    inlineMathValue: "inlineMathValue";

    blockMath: "blockMath";
    blockMathMarker: "blockMathMarker";
    blockMathValue: "blockMathValue";
  }
}

const DOLLAR = 36; // $
const BACKSLASH = 92; // \
const LEFT_PAREN = 40; // (
const RIGHT_PAREN = 41; // )
const LEFT_BRACKET = 91; // [
const RIGHT_BRACKET = 93; // ]

/**
 * micromark extension recognizing:
 *   $...$       inline math
 *   $$...$$     block math
 *   \( ... \)   inline math
 *   \[ ... \]   block math
 */
export function mathDelimitersTokenizer(): Extension {
  function tokenizeMath(effects: Effects, ok: State, nok: State): State {
    return start;

    function start(code: Code): State | undefined {
      if (code === DOLLAR) {
        effects.consume(code);
        return afterFirstDollar;
      }

      if (code === BACKSLASH) {
        effects.consume(code);
        return afterBackslash;
      }

      return nok(code);
    }

    /** Handles `$` start, deciding inline (`$`) or block (`$$`). */
    function afterFirstDollar(code: Code): State | undefined {
      if (code === DOLLAR) {
        // `$$` → block math
        effects.enter("blockMath");
        effects.enter("blockMathMarker");
        effects.consume(code);
        effects.exit("blockMathMarker");
        return blockValueStart;
      }

      // `$` → inline math
      effects.enter("inlineMath");
      effects.enter("inlineMathMarker");
      effects.exit("inlineMathMarker");
      return inlineValueStart(code);
    }

    /** Handles `\` start, expecting `(` or `[` */
    function afterBackslash(code: Code): State | undefined {
      if (code === LEFT_PAREN) {
        effects.enter("inlineMath");
        effects.enter("inlineMathMarker");
        effects.consume(code);
        effects.exit("inlineMathMarker");
        return inlineValueStart;
      }

      if (code === LEFT_BRACKET) {
        effects.enter("blockMath");
        effects.enter("blockMathMarker");
        effects.consume(code);
        effects.exit("blockMathMarker");
        return blockValueStart;
      }

      return nok(code);
    }

    /** After `$` or `\(`, begin inline value. */
    function inlineValueStart(code: Code): State | undefined {
      if (code === null) {
        return nok(code);
      }
      effects.enter("inlineMathValue");
      return inlineValue(code);
    }

    /** After `$$` or `\[`, begin block value. */
    function blockValueStart(code: Code): State | undefined {
      if (code === null) {
        return nok(code);
      }
      effects.enter("blockMathValue");
      return blockValue(code);
    }

    /** Inline math content until `$` or `\)` closes. */
    function inlineValue(code: Code): State | undefined {
      if (code === null) {
        return nok(code);
      }

      if (code === DOLLAR) {
        effects.exit("inlineMathValue");
        effects.enter("inlineMathMarker");
        return closeInlineDollar;
      }

      if (code === BACKSLASH) {
        effects.exit("inlineMathValue");
        return maybeInlineBackslash;
      }

      effects.consume(code);
      return inlineValue;
    }

    /** Block math content until `$$` or `\]` closes. */
    function blockValue(code: Code): State | undefined {
      if (code === null) {
        return nok(code);
      }

      if (code === DOLLAR) {
        effects.exit("blockMathValue");
        effects.enter("blockMathMarker");
        return closeBlockDollar;
      }

      if (code === BACKSLASH) {
        effects.exit("blockMathValue");
        return maybeBlockBackslash;
      }

      effects.consume(code);
      return blockValue;
    }

    /** Close inline marker `$` */
    function closeInlineDollar(code: Code): State | undefined {
      if (code !== DOLLAR) {
        return nok(code);
      }
      effects.consume(code);
      effects.exit("inlineMathMarker");
      effects.exit("inlineMath");
      return ok;
    }

    /** Close block marker `$$` */
    function closeBlockDollar(code: Code): State | undefined {
      if (code !== DOLLAR) {
        return nok(code);
      }
      effects.consume(code);
      effects.consume(code);
      effects.exit("blockMathMarker");
      effects.exit("blockMath");
      return ok;
    }

    /** Possibly closing `\)` for inline math */
    function maybeInlineBackslash(code: Code): State | undefined {
      if (code === RIGHT_PAREN) {
        effects.enter("inlineMathMarker");
        effects.consume(BACKSLASH);
        effects.exit("inlineMathMarker");
        effects.exit("inlineMath");
        return ok;
      }
      // Not closing, continue value
      effects.enter("inlineMathValue");
      effects.consume(BACKSLASH);
      return inlineValue(code);
    }

    /** Possibly closing `\]` for block math */
    function maybeBlockBackslash(code: Code): State | undefined {
      if (code === RIGHT_BRACKET) {
        effects.enter("blockMathMarker");
        effects.consume(BACKSLASH);
        effects.consume(code);
        effects.exit("blockMathMarker");
        effects.exit("blockMath");
        return ok;
      }
      // Not closing, continue block value
      effects.enter("blockMathValue");
      effects.consume(BACKSLASH);
      return blockValue(code);
    }
  }

  return {
    text: {
      [DOLLAR]: { tokenize: tokenizeMath },
      [BACKSLASH]: { tokenize: tokenizeMath }
    }
  };
}
