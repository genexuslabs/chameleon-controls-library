import { fromHTMLStringToHast } from "@genexus/markdown-parser/dist/parse-html.js";

export const rawHTMLToJSX = (
  htmlString: string,
  allowDangerousHtml: boolean
) => {
  // eslint-disable-next-line no-console
  console.log(
    fromHTMLStringToHast(htmlString, allowDangerousHtml, { fragment: true })
  );
};
