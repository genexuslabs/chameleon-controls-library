/**
 * Type definitions for the layout-to-svg pipeline.
 * These are for documentation only — the scripts are plain ESM (.mjs).
 */

// ─── Phase 1: Parser AST ────────────────────────────────────────────────

export interface LayoutCase {
  case: number;
  title: string;
  ast: LayoutNode;
}

export type LayoutNode =
  | ElementNode
  | SlotNode
  | TextNode
  | CommentWhenNode
  | CommentElseNode
  | CommentElseWhenNode
  | CommentForEachNode
  | CommentDescriptiveNode
  | RootNode;

export interface RootNode {
  type: "root";
  children: LayoutNode[];
}

export interface ElementNode {
  type: "element";
  tag: string;
  parts?: PartEntry[];
  attributes?: Record<string, string | boolean>;
  shadowRoot?: boolean;
  shadowDepth: number;
  children: LayoutNode[];
}

export interface SlotNode {
  type: "slot";
  tag: "slot";
  parts?: PartEntry[];
  attributes?: Record<string, string | boolean>;
  shadowDepth: number;
  children: LayoutNode[];
}

export interface TextNode {
  type: "text";
  text: string;
  shadowDepth: number;
}

export interface CommentWhenNode {
  type: "comment-when";
  condition: string;
  shadowDepth: number;
}

export interface CommentElseNode {
  type: "comment-else";
  description: string | null;
  shadowDepth: number;
}

export interface CommentElseWhenNode {
  type: "comment-else-when";
  condition: string;
  shadowDepth: number;
}

export interface CommentForEachNode {
  type: "comment-for-each";
  iteration: { item: string; collection: string };
  shadowDepth: number;
}

export interface CommentDescriptiveNode {
  type: "comment-descriptive";
  text: string;
  shadowDepth: number;
}

export interface PartEntry {
  name: string;
  dynamic: boolean;
  conditional: boolean;
  exclusive?: string[];
}

// ─── Phase 2: Layout Metadata ────────────────────────────────────────────

export interface LayoutMetadata {
  component: string;
  sourceHash: string;
  cases: CaseMetadata[];
}

export interface CaseMetadata {
  case: number;
  title: string;
  canvas: { width: number; height: number };
  nodes: Record<string, NodeVisualHints>;
}

export interface NodeVisualHints {
  direction?: "row" | "column";
  position?: "flow" | "absolute" | "overlay";
  widthRatio?: number;
  heightRatio?: number;
  fixedWidth?: number;
  fixedHeight?: number;
  alignSelf?: "start" | "center" | "end" | "stretch";
  hidden?: boolean;
  label?: string;
  style?: "container" | "interactive" | "text" | "decorative" | "slot";
  /** User-set flag to prevent AI from overwriting this entry */
  manual?: boolean;
}

// ─── Phase 3: Positioned layout (internal) ───────────────────────────────

export interface PositionedNode {
  node: LayoutNode;
  x: number;
  y: number;
  width: number;
  height: number;
  label: LabelInfo;
  children: PositionedNode[];
}

export interface LabelInfo {
  primary: string;
  secondary?: string;
  parts?: PartEntry[];
  width: number;
  height: number;
}
