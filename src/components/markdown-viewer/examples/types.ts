import { Literal } from "mdast";
import { CompileContext } from "mdast-util-from-markdown";

export interface ExtendedCompileContext extends CompileContext {
  current: () => { value: string; [key: string]: any };
}

export interface ButtonReference extends Literal {
  type: "buttonReference";
  value: string;
}

export type ExtendedContent = ButtonReference;

export type ExtendedContentMapping = {
  [key in ExtendedContent["type"]]: Extract<ExtendedContent, { type: key }>;
};

declare module "mdast" {
  interface StaticPhrasingContentMap {
    ButtonReference: ButtonReference;
  }
}
