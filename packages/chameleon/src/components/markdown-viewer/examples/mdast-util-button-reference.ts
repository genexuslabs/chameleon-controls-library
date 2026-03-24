import { Literal } from "mdast";
import type {
  CompileContext,
  Extension as FromMarkdownExtension,
  Handle
} from "mdast-util-from-markdown";
import { Token } from "micromark-util-types";
import { ButtonReference } from "./types";

/**
 * Handlers to translate micromark tokens into MDAST nodes.
 */
const handlers: { [key: string]: Handle } = {
  /**
   * Handles the entry of the 'buttonReference' token.
   * Creates a new 'buttonReference' node and pushes it onto the stack.
   */
  buttonReference: function (
    this: CompileContext,
    token: Token
  ): void | boolean {
    this.enter(
      {
        type: "buttonReference" as any, // TODO: Fix type error
        value: "" // The value will be filled by the 'buttonReferenceValue' handler
      },
      token
    );
  },
  /**
   * Handles the exit of the 'buttonReference' token.
   * Exits the current 'buttonReference' node.
   */
  buttonReferenceExit: function (
    this: CompileContext,
    token: Token
  ): void | boolean {
    this.exit(token);
  },
  /**
   * Handles the value within the button reference.
   * Concatenates the token's text to the value of the current 'buttonReference' node.
   */
  buttonReferenceValue: function (
    this: CompileContext,
    token: Token
  ): void | boolean {
    const node = this.stack[this.stack.length - 1]; // Get the current node (should be 'buttonReference')
    if (
      node &&
      (node as ButtonReference | Literal).type === "buttonReference"
    ) {
      (node as any as ButtonReference).value += this.sliceSerialize(token); // Add the token's text to the value
    }
  }
};

/**
 * Extension for `mdast-util-from-markdown` to handle `buttonReference` nodes.
 *
 * @returns {FromMarkdownExtension} The `mdast-util-from-markdown` extension.
 */
export function buttonReferenceFromMarkdown(): FromMarkdownExtension {
  return {
    canContainEols: ["buttonReference"], // Allows the value to contain line endings (if Micromark allows it)
    enter: {
      buttonReference: handlers.buttonReference
    },
    exit: {
      buttonReference: handlers.buttonReferenceExit,
      buttonReferenceValue: handlers.buttonReferenceValue
    }
  };
}
