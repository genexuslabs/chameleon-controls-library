/**
 * Converts an object mapping token keys to booleans into a space-separated
 * string containing the token keys that map to truthy values.
 * @example
 *   part={tokenMap({
 *     header: true,
 *     disabled: this.disabled,
 *     selected: this.selected,
 *     [levelPart]: canShowLines,
 *     "expand-button":
 *       canShowLines && !this.leaf && this.expandableButton !== "no"
 *   })}
 */
export const tokenMap = (tokens: {
  [key: string]: boolean | undefined | null;
}) => {
  const keys = Object.keys(tokens);
  let result = "";

  for (let index = 0; index < keys.length; index++) {
    const tokenKey = keys[index];
    const tokenValue = tokens[tokenKey];

    if (tokenValue) {
      result += result === "" ? tokenKey : ` ${tokenKey}`;
    }
  }

  return result;
};
