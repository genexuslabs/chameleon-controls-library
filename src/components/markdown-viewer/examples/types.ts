import type { Literal } from "mdast";

export interface ButtonReference extends Literal {
  type: "buttonReference";
}

export type ExtendedContent = ButtonReference;

export type ExtendedContentMapping = {
  [key in ExtendedContent["type"]]: Extract<ExtendedContent, { type: key }>;
};

declare module "mdast" {
  interface StaticPhrasingContentMap {
    buttonReference: ButtonReference;
  }
}
