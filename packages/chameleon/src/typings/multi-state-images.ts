/**
 * Specifies how the image will be rendered.
 */
export type ImageRender = "background" | "img" | "mask";

export type GxImageMultiState = {
  base: string;
  hover?: string;
  active?: string;
  focus?: string;
  selected?: string;
  disabled?: string;
};

export type GxImageMultiStateByDirection<T extends "start" | "end"> =
  T extends "start" ? GxImageMultiStateStart : GxImageMultiStateEnd;

export type GxImageMultiStateStart = {
  classes: string;
  styles: GxImageMultiStateStartStyles;
};

export type GxImageMultiStateStartStyles = {
  "--ch-start-img--base": string;
  "--ch-start-img--hover"?: string;
  "--ch-start-img--active"?: string;
  "--ch-start-img--focus"?: string;
  "--ch-start-img--selected"?: string;
  "--ch-start-img--disabled"?: string;
};

export type GxImageMultiStateEnd = {
  classes: string;
  styles: GxImageMultiStateEndStyles;
};

export type GxImageMultiStateEndStyles = {
  "--ch-end-img--base": string;
  "--ch-end-img--hover"?: string;
  "--ch-end-img--active"?: string;
  "--ch-end-img--focus"?: string;
  "--ch-end-img--selected"?: string;
  "--ch-end-img--disabled"?: string;
};

export type GetImagePathCallback = (
  imageSrc: string | unknown | undefined
) => GxImageMultiState | undefined;
