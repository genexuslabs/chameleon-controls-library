import { Code, Effects, Extension, State } from "micromark-util-types";

// Declare custom token types for better TypeScript integration
declare module "micromark-util-types" {
  interface TokenTypeMap {
    buttonReference: "buttonReference";
    buttonReferenceMarker: "buttonReferenceMarker";
    buttonReferenceValue: "buttonReferenceValue";
  }
}

const LEFT_SQUARE_BRACKET = 91;
const RIGHT_SQUARE_BRACKET = 93;

/**
 * Micromark extension to recognize the `[[ Value ]]` syntax as a
 * `"buttonReference"` token.
 */
export function buttonReference(): Extension {
  /**
   * This is the main function that initializes the tokenizer.
   * It's called when micromark tries to parse a starting character.
   * In this case, we look for the first `[`.
   */
  function tokenizeButtonReference(
    effects: Effects,
    ok: State,
    nok: State
  ): State {
    return start;

    /**
     * Initial state: Expects the first `[`.
     * If it's not `[`, it fails and passes control to other tokenizers.
     * If it is `[`, it consumes the character and moves to the `openBracket` state.
     */
    function start(code: Code): State | undefined {
      // Must be the first `[`.
      if (code !== LEFT_SQUARE_BRACKET) {
        return nok(code);
      }
      effects.enter("buttonReference"); // Enter the 'buttonReference' token type
      effects.enter("buttonReferenceMarker"); // Enter the opening marker
      effects.consume(code); // Consume the first `[`
      return openBracket;
    }

    /**
     * Expects the second `[`.
     * If it's not `[`, it fails.
     * If it is `[`, it consumes the character and moves to the `afterOpenBrackets` state.
     */
    function openBracket(code: Code): State | undefined {
      if (code !== LEFT_SQUARE_BRACKET) {
        return nok(code);
      }
      effects.consume(code); // Consume the second `[`
      effects.exit("buttonReferenceMarker"); // Exit the opening marker
      return afterOpenBrackets;
    }

    /**
     * After `[[`, expects the value.
     * The value can contain any character except `]` or EOF.
     */
    function afterOpenBrackets(code: Code): State | undefined {
      // If we reach a `]` or EOF, the value has ended.
      // If there's no value between the brackets, it's not a valid reference.
      // This prevents [[ ]] from being a valid reference unless you want to allow it.
      // If you want to allow it, remove this condition or adjust `nok`.
      // For this example, we require at least one character.
      if (code === null || code === RIGHT_SQUARE_BRACKET) {
        return nok(code);
      }

      effects.enter("buttonReferenceValue"); // Enter the button value
      return inValue(code);
    }

    /**
     * Consumes characters that form the value.
     * Continues consuming until it finds a `]` or EOF.
     */
    function inValue(code: Code): State | undefined {
      if (code === null || code === RIGHT_SQUARE_BRACKET) {
        effects.exit("buttonReferenceValue"); // Exit the button value
        effects.enter("buttonReferenceMarker"); // Enter the closing marker
        return closeBracket(code);
      }
      effects.consume(code); // Consume the current character
      return inValue;
    }

    /**
     * Expects the first `]`.
     * If it's not `]`, it fails.
     * If it is `]`, it consumes the character and moves to the `closeBracket` state.
     */
    function closeBracket(code: Code): State | undefined {
      if (code !== RIGHT_SQUARE_BRACKET) {
        return nok(code);
      }
      effects.consume(code); // Consume the first `]`
      return afterFirstCloseBracket;
    }

    /**
     * Expects the second `]`.
     * If it's not `]`, it fails.
     * If it is `]`, it consumes the character and successfully finishes.
     */
    function afterFirstCloseBracket(code: Code): State | undefined {
      if (code !== RIGHT_SQUARE_BRACKET) {
        return nok(code);
      }
      effects.consume(code); // Consume the second `]`
      effects.exit("buttonReferenceMarker"); // Exit the closing marker
      effects.exit("buttonReference"); // Exit the 'buttonReference' token type
      return ok(code); // Signal success
    }
  }

  return {
    text: {
      // When the tokenizer encounters a `[`, it attempts to apply `tokenizeButtonReference`.
      // Code `91` is the ASCII code for `[`.
      [LEFT_SQUARE_BRACKET]: {
        tokenize: tokenizeButtonReference
      }
    }
  };
}
