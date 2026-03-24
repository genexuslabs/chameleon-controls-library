import type { Literal } from "mdast";

export interface BlockMath extends Literal {
  type: "blockMath";
}

export interface InlineMath extends Literal {
  type: "inlineMath";
}

export type ExtendedContent = BlockMath | InlineMath;

export type ExtendedContentMapping = {
  [key in ExtendedContent["type"]]: Extract<ExtendedContent, { type: key }>;
};

// Add nodes to tree.
declare module "mdast" {
  interface BlockContentMap {
    blockMath: BlockMath;
  }

  interface PhrasingContentMap {
    inlineMath: InlineMath;
  }

  interface RootContentMap {
    inlineMath: InlineMath;
    blockMath: BlockMath;
  }
}
