export type Mutable<Immutable> = {
  -readonly [P in keyof Immutable]: Immutable[P];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
};

export type FilterByPrefix<
  T,
  Prefix extends string
> = T extends `${Prefix}${string}` ? T : never;

/**
 * Useful to filtering the keys of an object by pattern matching the keys. For
 * example, all Chameleon controls:
 *
 * @example
 * ```ts
 * type ChameleonControlsTagName = FilterKeys<
 *   HTMLElementTagNameMap,
 *   `ch-${string}`
 * >
 * ```
 */
export type FilterKeys<T, U> = {
  [K in keyof T]: K extends U ? K : never;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type ArgumentTypes<F extends Function> = F extends (
  ...args: infer A
) => unknown
  ? A
  : never;
