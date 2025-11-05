// mdast-util-from-markdown-math.ts
import type {
  CompileContext,
  Extension as FromMarkdownExtension,
  Handle
} from "mdast-util-from-markdown";
import { Token } from "micromark-util-types";
import { BlockMath, InlineMath } from "./types";

/**
 * Handlers for converting micromark tokens into MDAST nodes.
 */
const handlers: Record<string, Handle> = {
  inlineMath(this: CompileContext, token: Token) {
    this.enter({ type: "inlineMath", value: "" }, token);
  },
  inlineMathExit(this: CompileContext, token: Token) {
    this.exit(token);
  },
  inlineMathValue(this: CompileContext, token: Token) {
    const node = this.stack[this.stack.length - 1] as InlineMath | undefined;
    if (node && node.type === "inlineMath") {
      node.value += this.sliceSerialize(token);
    }
  },
  blockMath(this: CompileContext, token: Token) {
    this.enter({ type: "blockMath", value: "" }, token);
  },
  blockMathExit(this: CompileContext, token: Token) {
    this.exit(token);
  },
  blockMathValue(this: CompileContext, token: Token) {
    const node = this.stack[this.stack.length - 1] as BlockMath | undefined;
    if (node && node.type === "blockMath") {
      node.value += this.sliceSerialize(token);
    }
  }
};

/**
 * mdast-util-from-markdown extension to build math nodes.
 */
export function mathDelimitersFromMarkdown(): FromMarkdownExtension {
  return {
    canContainEols: ["blockMath", "inlineMath"],
    enter: {
      inlineMath: handlers.inlineMath,
      blockMath: handlers.blockMath
    },
    exit: {
      inlineMath: handlers.inlineMathExit,
      inlineMathValue: handlers.inlineMathValue,
      blockMath: handlers.blockMathExit,
      blockMathValue: handlers.blockMathValue
    }
  };
}
