import { ImageRender } from "../../../common/types";

export type GenerativeUISample = {
  caption: string;
  imageSrc: string;
  imageType?: Exclude<ImageRender, "img">;
  html?: string;
  prompt: string;
  initializeModels: (renderRef: HTMLElement) => void;
};

export type GenerativeUIModel = GenerativeUIMessage[];

export type GenerativeUIMessage =
  | GenerativeUIMessageUser
  | GenerativeUIMessageAssistant;

export type GenerativeUIMessageUser = {
  role: "user";
  content: string;
};

export type GenerativeUIMessageAssistant = {
  role: "assistant";
  content: string;
};
