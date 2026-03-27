import type { Root } from "hast";
import type { Options } from "hast-util-from-html";
import { fromHtml } from "hast-util-from-html";
import { sanitize } from "hast-util-sanitize";

export const fromHTMLStringToHast = (
  htmlString: string,
  allowDangerousHtml: boolean,
  options?: Readonly<Options> | null | undefined
): Root =>
  allowDangerousHtml
    ? fromHtml(htmlString, options)
    : // sanitize() is typed as Nodes → Nodes, but structurally preserves Root
      // when given a Root — the cast is safe.
      (sanitize(fromHtml(htmlString, options)) as Root);
