/**
 * Force a value to follow CSS minimum and maximum rules. Note that the minimum
 * value can be greater than the maximum value, as implemented by the CSS
 * specification.
 * The maximum value can be `NaN`. In this case only the minimum value rule
 * will be apply.
 */
export const forceCSSMinMax = (
  value: number,
  minimum: number,
  maximum: number
): number =>
  Number.isNaN(maximum)
    ? Math.max(value, minimum)
    : Math.max(Math.min(value, maximum), minimum);
