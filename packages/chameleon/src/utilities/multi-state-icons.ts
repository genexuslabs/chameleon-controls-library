import type {
  GxImageMultiState,
  GxImageMultiStateEndStyles,
  GxImageMultiStateStartStyles,
  ImageRender
} from "../typings/multi-state-images";

const VALID_CSS_URL_PATH_REGEX = /^\s*(var\(|url\()/;

// TODO: Test more use cases
export const formatImagePath = <T extends string | undefined>(
  imageSrc: T,
  imageType?: ImageRender
) =>
  !imageSrc || imageType === "img" || VALID_CSS_URL_PATH_REGEX.test(imageSrc)
    ? imageSrc
    : (`url(${imageSrc})` as const);

export const updateDirectionInImageCustomVar = <T extends "start" | "end">(
  image: GxImageMultiState | undefined,
  direction: T,
  imageType: ImageRender = "background"
):
  | {
      classes: string;
      styles: GxImageMultiStateStartStyles | GxImageMultiStateEndStyles;
    }
  | undefined => {
  if (!image) {
    return undefined;
  }

  if (direction === "start") {
    let states = "start-img--base";

    const startImg: GxImageMultiStateStartStyles = {
      "--ch-start-img--base": formatImagePath(image.base, imageType)
    };

    if (image.active) {
      startImg["--ch-start-img--active"] = formatImagePath(
        image.active,
        imageType
      );
      states += " start-img--active";
    }
    if (image.focus) {
      startImg["--ch-start-img--focus"] = formatImagePath(
        image.focus,
        imageType
      );
      states += " start-img--focus";
    }
    if (image.hover) {
      startImg["--ch-start-img--hover"] = formatImagePath(
        image.hover,
        imageType
      );
      states += " start-img--hover";
    }
    if (image.selected) {
      startImg["--ch-start-img--selected"] = formatImagePath(
        image.selected,
        imageType
      );
      states += " start-img--selected";
    }
    if (image.disabled) {
      startImg["--ch-start-img--disabled"] = formatImagePath(
        image.disabled,
        imageType
      );
      states += " start-img--disabled";
    }

    return { classes: states, styles: startImg };
  }

  let states = "end-img--base";
  const endImg: GxImageMultiStateEndStyles = {
    "--ch-end-img--base": formatImagePath(image.base, imageType)
  };

  if (image.active) {
    endImg["--ch-end-img--active"] = formatImagePath(image.active, imageType);
    states += " end-img--active";
  }
  if (image.focus) {
    endImg["--ch-end-img--focus"] = formatImagePath(image.focus, imageType);
    states += " end-img--focus";
  }
  if (image.hover) {
    endImg["--ch-end-img--hover"] = formatImagePath(image.hover, imageType);
    states += " end-img--hover";
  }
  if (image.selected) {
    endImg["--ch-end-img--selected"] = formatImagePath(
      image.selected,
      imageType
    );
    states += " end-img--selected";
  }
  if (image.disabled) {
    endImg["--ch-end-img--disabled"] = formatImagePath(
      image.disabled,
      imageType
    );
    states += " end-img--disabled";
  }

  return { classes: states, styles: endImg };
};
