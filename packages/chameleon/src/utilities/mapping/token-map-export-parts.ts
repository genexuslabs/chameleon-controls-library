/**
 * Same as tokenMap, but for the exportparts attribute.
 * @example
 *   part={tokenMapExportParts({
 *     header: true,
 *     disabled: this.disabled,
 *     selected: this.selected,
 *     [levelPart]: canShowLines,
 *     "expand-button":
 *       canShowLines && !this.leaf && this.expandableButton !== "no"
 *   }, "window")}
 */
export const tokenMapExportParts = (
  tokens: { [key: string]: boolean | undefined | null },
  partToRename: string
) => {
  const keys = Object.keys(tokens);
  let result = "";

  for (let index = 0; index < keys.length; index++) {
    const tokenKey = keys[index];
    const tokenValue = tokens[tokenKey];

    if (tokenValue) {
      result +=
        result === ""
          ? `${partToRename}:${tokenKey}`
          : `,${partToRename}:${tokenKey}`;
    }
  }

  return result;
};
