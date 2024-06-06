import { h } from "@stencil/core";
import { ImageRender } from "./types";

export const renderImg = (
  cssClass: string,
  parts: string,
  src: string,
  imageType: ImageRender
) =>
  imageType === "img" &&
  src && (
    <img
      aria-hidden="true"
      class={cssClass}
      part={parts}
      alt=""
      src={src}
      loading="lazy"
    />
  );
