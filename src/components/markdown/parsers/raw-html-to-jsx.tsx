import { fromHTMLStringToHast } from "@genexus/markdown-parser/dist/parse-html.js";

export const rawHTMLToJSX = (
  htmlString: string,
  allowDangerousHtml: boolean
) => {
  console.log(
    fromHTMLStringToHast(htmlString, allowDangerousHtml, { fragment: true })
  );
};
