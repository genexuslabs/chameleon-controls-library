import { factorySpace } from "micromark-factory-space";
import { markdownLineEnding } from "micromark-util-character";
import {
  Code,
  Construct,
  Effects,
  Extension,
  State,
  TokenizeContext
} from "micromark-util-types";

// Import constants and types from micromark-util-symbol
const constants = {
  tabSize: 4
} as const;

const types = {
  linePrefix: "linePrefix" as const,
  lineEnding: "lineEnding" as const,
  whitespace: "whitespace" as const
};

/**
 * Token type augmentation for TypeScript.
 */
declare module "micromark-util-types" {
  interface TokenTypeMap {
    inlineMath: "inlineMath";
    inlineMathSequence: "inlineMathSequence";
    inlineMathData: "inlineMathData";

    mathFlow: "mathFlow";
    mathFlowFence: "mathFlowFence";
    mathFlowFenceSequence: "mathFlowFenceSequence";
    mathFlowValue: "mathFlowValue";

    linePrefix: "linePrefix";
    lineEnding: "lineEnding";
    whitespace: "whitespace";
  }
}

const BACKSLASH = 92; // \
const LEFT_PAREN = 40; // (
const RIGHT_PAREN = 41; // )
const LEFT_BRACKET = 91; // [
const RIGHT_BRACKET = 93; // ]

/**
 * micromark extension recognizing:
 *   $...$       inline math (from micromark-extension-math)
 *   $$...$$     block math (from micromark-extension-math)
 *   \( ... \)   inline math (LaTeX)
 *   \[ ... \]   block math (LaTeX)
 */
export function mathDelimitersTokenizer(): Extension {
  // Inline math with \(...\)
  const inlineBackslashParen: Construct = {
    tokenize: tokenizeInlineBackslashParen,
    name: "inlineBackslashParen"
  };

  function tokenizeInlineBackslashParen(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State
  ): State {
    return start;

    function start(code: Code): State | undefined {
      if (code !== BACKSLASH) {
        return nok(code);
      }
      effects.consume(code);
      return openParen;
    }

    function openParen(code: Code): State | undefined {
      if (code !== LEFT_PAREN) {
        return nok(code);
      }
      effects.enter("inlineMath");
      effects.enter("inlineMathSequence");
      effects.consume(code);
      effects.exit("inlineMathSequence");
      return between;
    }

    function between(code: Code): State | undefined {
      if (code === null) {
        return nok(code);
      }

      if (code === BACKSLASH) {
        return closingStart;
      }

      if (markdownLineEnding(code)) {
        return nok(code);
      }

      effects.enter("inlineMathData");
      return data(code);
    }

    function data(code: Code): State | undefined {
      if (code === null || code === BACKSLASH || markdownLineEnding(code)) {
        effects.exit("inlineMathData");
        return between(code);
      }

      effects.consume(code);
      return data;
    }

    function closingStart(code: Code): State | undefined {
      effects.consume(code); // consume backslash
      return closingParen;
    }

    function closingParen(code: Code): State | undefined {
      if (code === RIGHT_PAREN) {
        effects.enter("inlineMathSequence");
        effects.consume(code);
        effects.exit("inlineMathSequence");
        effects.exit("inlineMath");
        return ok;
      }

      // Not closing, backslash was part of content
      effects.enter("inlineMathData");
      return data(code);
    }
  }

  // Block math with \[...\] - following mathFlow pattern
  const blockBackslashBracket: Construct = {
    tokenize: tokenizeBlockBackslashBracket,
    concrete: true,
    name: "blockBackslashBracket"
  };

  const nonLazyContinuation: Construct = {
    tokenize: tokenizeNonLazyContinuation,
    partial: true
  };

  function tokenizeBlockBackslashBracket(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State
  ): State {
    const self = this;
    const tail = self.events[self.events.length - 1];
    const initialSize =
      tail && tail[1].type === types.linePrefix
        ? tail[2].sliceSerialize(tail[1], true).length
        : 0;

    return start;

    function start(code: Code): State | undefined {
      if (code !== BACKSLASH) {
        return nok(code);
      }
      effects.enter("mathFlow");
      effects.enter("mathFlowFence");
      effects.enter("mathFlowFenceSequence");
      effects.consume(code);
      return openBracket;
    }

    function openBracket(code: Code): State | undefined {
      if (code !== LEFT_BRACKET) {
        effects.exit("mathFlowFenceSequence");
        effects.exit("mathFlowFence");
        effects.exit("mathFlow");
        return nok(code);
      }
      effects.consume(code);
      effects.exit("mathFlowFenceSequence");
      effects.exit("mathFlowFence");
      return afterOpeningFence;
    }

    function afterOpeningFence(code: Code): State | undefined {
      if (self.interrupt) {
        return ok(code);
      }

      return effects.attempt(
        nonLazyContinuation,
        beforeNonLazyContinuation,
        after
      )(code);
    }

    function beforeNonLazyContinuation(code: Code): State | undefined {
      return effects.attempt(
        { tokenize: tokenizeClosingFence, partial: true },
        after,
        contentStart
      )(code);
    }

    function contentStart(code: Code): State | undefined {
      return (
        initialSize
          ? factorySpace(
              effects,
              beforeContentChunk,
              types.linePrefix,
              initialSize + 1
            )
          : beforeContentChunk
      )(code);
    }

    function beforeContentChunk(code: Code): State | undefined {
      if (code === null) {
        return after(code);
      }

      if (markdownLineEnding(code)) {
        return effects.attempt(
          nonLazyContinuation,
          beforeNonLazyContinuation,
          after
        )(code);
      }

      effects.enter("mathFlowValue");
      return contentChunk(code);
    }

    function contentChunk(code: Code): State | undefined {
      if (code === null || markdownLineEnding(code)) {
        effects.exit("mathFlowValue");
        return beforeContentChunk(code);
      }

      effects.consume(code);
      return contentChunk;
    }

    function after(code: Code): State | undefined {
      effects.exit("mathFlow");
      return ok(code);
    }

    function tokenizeClosingFence(
      effects: Effects,
      ok: State,
      nok: State
    ): State {
      return factorySpace(
        effects,
        beforeSequenceClose,
        types.linePrefix,
        self.parser.constructs.disable.null &&
          self.parser.constructs.disable.null.includes("codeIndented")
          ? undefined
          : constants.tabSize
      );

      function beforeSequenceClose(code: Code): State | undefined {
        if (code !== BACKSLASH) {
          return nok(code);
        }
        effects.enter("mathFlowFence");
        effects.enter("mathFlowFenceSequence");
        effects.consume(code);
        return sequenceClose;
      }

      function sequenceClose(code: Code): State | undefined {
        if (code === RIGHT_BRACKET) {
          effects.consume(code);
          effects.exit("mathFlowFenceSequence");
          return factorySpace(effects, afterSequenceClose, types.whitespace);
        }

        return nok(code);
      }

      function afterSequenceClose(code: Code): State | undefined {
        if (code === null || markdownLineEnding(code)) {
          effects.exit("mathFlowFence");
          return ok(code);
        }

        return nok(code);
      }
    }
  }

  function tokenizeNonLazyContinuation(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State
  ): State {
    const self = this;

    return start;

    function start(code: Code): State | undefined {
      if (code === null) {
        return ok(code);
      }

      effects.enter(types.lineEnding);
      effects.consume(code);
      effects.exit(types.lineEnding);
      return lineStart;
    }

    function lineStart(code: Code): State | undefined {
      return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
    }
  }

  return {
    text: {
      [BACKSLASH]: inlineBackslashParen
    },
    flow: {
      [BACKSLASH]: blockBackslashBracket
    }
  };
}
