import type {
  CompileContext,
  Extension as FromMarkdownExtension
} from "mdast-util-from-markdown";
import { BlockMath, InlineMath } from "./types";

/**
 * mdast-util-from-markdown extension to build math nodes from micromark tokens.
 *
 * This extension handles the conversion of tokenized math delimiters into
 * proper MDAST nodes that can be used in the markdown AST.
 */
export function mathDelimitersFromMarkdown(): FromMarkdownExtension {
  return {
    enter: {
      mathFlow: enterMathFlow,
      inlineMath: enterInlineMath
    },
    exit: {
      mathFlow: exitMathFlow,
      mathFlowFence: exitMathFlowFence,
      mathFlowValue: exitMathData,
      inlineMath: exitInlineMath,
      inlineMathData: exitMathData
    }
  };

  function enterMathFlow(this: CompileContext, token: any) {
    this.enter(
      {
        type: "blockMath",
        value: "",
        data: {
          hName: "div",
          hProperties: { className: ["math", "math-display"] }
        }
      },
      token
    );
  }

  function exitMathFlowFence(this: CompileContext) {
    // Exit if this is the closing fence
    if ((this.data as any).mathFlowInside) {
      return;
    }
    this.buffer();
    (this.data as any).mathFlowInside = true;
  }

  function exitMathFlow(this: CompileContext, token: any) {
    const data = this.resume().replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
    const node = this.stack[this.stack.length - 1] as BlockMath;
    this.exit(token);
    node.value = data;
    (this.data as any).mathFlowInside = undefined;
  }

  function enterInlineMath(this: CompileContext, token: any) {
    this.enter(
      {
        type: "inlineMath",
        value: "",
        data: {
          hName: "span",
          hProperties: { className: ["math", "math-inline"] }
        }
      },
      token
    );
    this.buffer();
  }

  function exitInlineMath(this: CompileContext, token: any) {
    const data = this.resume();
    const node = this.stack[this.stack.length - 1] as InlineMath;
    this.exit(token);
    node.value = data;
  }

  function exitMathData(this: CompileContext, token: any) {
    this.config.enter.data.call(this, token);
    this.config.exit.data.call(this, token);
  }
}
