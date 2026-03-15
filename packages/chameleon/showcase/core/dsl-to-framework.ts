import type {
  ComponentRenderModel,
  ComponentRenderStates,
  ComponentRenderTemplate,
  ComponentRenderTemplateItem,
  ComponentRenderTemplateItemNode
} from "../../src/components/playground-editor/typings/component-render";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                       Shared helpers
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function indent(str: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return str
    .split("\n")
    .map(line => (line.trim() === "" ? "" : pad + line))
    .join("\n");
}

/** Returns the property value as a literal: quoted string, number, or boolean. */
function literalValue(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

/**
 * Given a template property value, determine if it references a state by name.
 * Returns the state name if it does, null otherwise.
 */
function getStateRef(
  value: unknown,
  states: ComponentRenderStates | undefined
): string | null {
  if (typeof value === "string" && states && states[value] !== undefined) {
    return value;
  }
  return null;
}

/** Convert camelCase to kebab-case for HTML attribute names. */
function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
}

/** Convert event name (e.g. "input") to React-style prop (e.g. "onInput"). */
function eventToReactProp(event: string): string {
  return "on" + event.charAt(0).toUpperCase() + event.slice(1);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                   Template rendering
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface RenderContext {
  states: ComponentRenderStates | undefined;
  framework: "lit" | "react" | "angular";
  /** Whether to prefix state access with "this." (Lit/Angular class context). */
  statePrefix: string;
}

function renderNodeAttrs(
  node: ComponentRenderTemplateItemNode,
  ctx: RenderContext
): string[] {
  const attrs: string[] = [];
  const { states, framework, statePrefix } = ctx;

  // Properties
  for (const [key, value] of Object.entries(node.properties ?? {})) {
    const ref = getStateRef(value, states);
    if (framework === "lit") {
      if (ref) {
        attrs.push(`.${key}=\${${statePrefix}${ref}}`);
      } else {
        attrs.push(`.${key}=\${${literalValue(value)}}`);
      }
    } else if (framework === "react") {
      if (ref) {
        attrs.push(`${key}={${statePrefix}${ref}}`);
      } else {
        attrs.push(`${key}={${literalValue(value)}}`);
      }
    } else {
      // Angular: [prop]="val" for dynamic, prop="val" for static
      if (ref) {
        attrs.push(`[${key}]="${statePrefix}${ref}"`);
      } else {
        const lit = value;
        if (typeof lit === "boolean") {
          attrs.push(lit ? `[${key}]="true"` : `[${key}]="false"`);
        } else if (typeof lit === "number") {
          attrs.push(`[${key}]="${lit}"`);
        } else {
          attrs.push(`${camelToKebab(key)}="${lit}"`);
        }
      }
    }
  }

  // Events
  for (const [eventName, eventRef] of Object.entries(node.events ?? {})) {
    const handlerName = eventRef.eventHandlerName;
    if (framework === "lit") {
      attrs.push(`@${eventName}=\${${statePrefix}#${handlerName}}`);
    } else if (framework === "react") {
      attrs.push(`${eventToReactProp(eventName)}={${handlerName}}`);
    } else {
      // Angular
      attrs.push(`(${eventName})="${handlerName}($event)"`);
    }
  }

  return attrs;
}

function renderTemplateNode(
  node: ComponentRenderTemplateItemNode,
  ctx: RenderContext,
  baseIndent = 0
): string {
  const attrs = renderNodeAttrs(node, ctx);
  const tag = node.tag;
  const attrStr =
    attrs.length === 0
      ? ""
      : "\n" + attrs.map(a => indent(a, baseIndent + 2)).join("\n") + "\n" + " ".repeat(baseIndent);

  if (!node.children) {
    if (ctx.framework === "react") {
      return `<${tag}${attrStr}/>`;
    }
    return `<${tag}${attrStr}></${tag}>`;
  }

  const children = renderTemplateItems(node.children, ctx, baseIndent + 2);
  return `<${tag}${attrStr}>\n${children}\n${" ".repeat(baseIndent)}</${tag}>`;
}

function renderTemplateItem(
  item: ComponentRenderTemplateItem,
  ctx: RenderContext,
  baseIndent: number
): string {
  if (typeof item === "string") {
    return " ".repeat(baseIndent) + item;
  }
  return " ".repeat(baseIndent) + renderTemplateNode(item, ctx, baseIndent);
}

function renderTemplateItems(
  template: ComponentRenderTemplate,
  ctx: RenderContext,
  baseIndent = 0
): string {
  const items = Array.isArray(template) ? template : [template];
  return items.map(item => renderTemplateItem(item, ctx, baseIndent)).join("\n");
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                     State helpers
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/** Returns all states referenced in the template (property values matching state keys). */
function getReferencedStates(
  template: ComponentRenderTemplate,
  states: ComponentRenderStates | undefined
): string[] {
  if (!states) return [];
  const referenced = new Set<string>();

  function walk(t: ComponentRenderTemplate) {
    const items = Array.isArray(t) ? t : [t];
    for (const item of items) {
      if (typeof item === "string") continue;
      for (const value of Object.values(item.properties ?? {})) {
        if (typeof value === "string" && states[value] !== undefined) {
          referenced.add(value);
        }
      }
      if (item.children) walk(item.children);
    }
  }

  walk(template);
  // Also include all states — even if not explicitly in properties, they're part of the model
  for (const key of Object.keys(states)) {
    referenced.add(key);
  }
  return Array.from(referenced);
}

/** Returns the first-level template nodes (used to collect event handler info). */
function collectNodes(template: ComponentRenderTemplate): ComponentRenderTemplateItemNode[] {
  const items = Array.isArray(template) ? template : [template];
  const nodes: ComponentRenderTemplateItemNode[] = [];
  for (const item of items) {
    if (typeof item !== "string") nodes.push(item);
  }
  return nodes;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                    Lit code generation
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function toLitTemplate(model: ComponentRenderModel): string {
  const ctx: RenderContext = {
    states: model.states,
    framework: "lit",
    statePrefix: ""
  };
  return renderTemplateItems(model.template, ctx, 6);
}

export function toLitReduced(model: ComponentRenderModel): string {
  return `html\`\n${toLitTemplate(model)}\n      \``;
}

export function toLitComplete(model: ComponentRenderModel): string {
  const states = model.states ?? {};
  const stateNames = getReferencedStates(model.template, model.states);
  const nodes = collectNodes(model.template);
  const templateTag = typeof model.template === "string"
    ? model.template
    : Array.isArray(model.template)
      ? (typeof model.template[0] !== "string" ? model.template[0].tag : "div")
      : (model.template as ComponentRenderTemplateItemNode).tag;

  // @state() declarations
  const stateDecls = stateNames
    .map(name => {
      const state = states[name];
      const defaultVal = literalValue(state.value);
      return `  @state() ${name} = ${defaultVal};`;
    })
    .join("\n");

  // Private event handler methods
  const handlerDecls: string[] = [];
  if (model.events) {
    for (const [handlerName] of Object.entries(model.events)) {
      // Find which state this handler updates by looking at nodes
      const updatedState = stateNames.find(s => {
        // Heuristic: the handler name often contains the state name
        return handlerName.toLowerCase().includes(s.toLowerCase());
      }) ?? stateNames[0];

      if (updatedState) {
        handlerDecls.push(
          `  #${handlerName} = (event: CustomEvent) => {\n    this.${updatedState} = event.detail as typeof this.${updatedState};\n  };`
        );
      }
    }
  }

  const ctx: RenderContext = {
    states: model.states,
    framework: "lit",
    statePrefix: "this."
  };
  const templateBody = renderTemplateItems(model.template, ctx, 6);

  const imports = [
    `import { LitElement, html } from 'lit';`,
    `import { customElement, state } from 'lit/decorators.js';`,
    `// Import Chameleon component`,
    `import '../../src/components/${templateTag.replace("ch-", "")}/';`
  ].join("\n");

  const classParts: string[] = [];
  if (stateDecls) classParts.push(stateDecls);
  if (handlerDecls.length) classParts.push(handlerDecls.join("\n\n"));
  classParts.push(`  override render() {\n    return html\`\n${templateBody}\n    \`;\n  }`);

  return `${imports}

@customElement('my-app')
export class MyApp extends LitElement {
${classParts.join("\n\n")}
}
`;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                   React code generation
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function toReactComplete(model: ComponentRenderModel): string {
  const states = model.states ?? {};
  const stateNames = getReferencedStates(model.template, model.states);
  const templateTag = typeof model.template === "string"
    ? model.template
    : Array.isArray(model.template)
      ? (typeof model.template[0] !== "string" ? model.template[0].tag : "div")
      : (model.template as ComponentRenderTemplateItemNode).tag;

  // useState declarations
  const stateDecls = stateNames
    .map(name => {
      const state = states[name];
      const setter = "set" + name.charAt(0).toUpperCase() + name.slice(1);
      return `  const [${name}, ${setter}] = useState(${literalValue(state.value)});`;
    })
    .join("\n");

  // Handler functions
  const handlerDecls: string[] = [];
  if (model.events) {
    for (const [handlerName] of Object.entries(model.events)) {
      const updatedState = stateNames.find(s =>
        handlerName.toLowerCase().includes(s.toLowerCase())
      ) ?? stateNames[0];

      if (updatedState) {
        const setter = "set" + updatedState.charAt(0).toUpperCase() + updatedState.slice(1);
        handlerDecls.push(
          `  const ${handlerName} = (event: CustomEvent) => {\n    ${setter}(event.detail as typeof ${updatedState});\n  };`
        );
      }
    }
  }

  const ctx: RenderContext = {
    states: model.states,
    framework: "react",
    statePrefix: ""
  };
  const templateBody = renderTemplateItems(model.template, ctx, 4);

  const hasStates = stateNames.length > 0;
  const imports = [
    hasStates ? `import { useState } from 'react';` : `import React from 'react';`,
    `// Import Chameleon component`,
    `import '../../src/components/${templateTag.replace("ch-", "")}/';`
  ].join("\n");

  const bodyParts: string[] = [];
  if (stateDecls) bodyParts.push(stateDecls);
  if (handlerDecls.length) bodyParts.push(handlerDecls.join("\n\n"));

  return `${imports}

export function App() {
${bodyParts.join("\n\n")}

  return (
${templateBody}
  );
}
`;
}

export function toReactReduced(model: ComponentRenderModel): string {
  const ctx: RenderContext = {
    states: model.states,
    framework: "react",
    statePrefix: ""
  };
  return renderTemplateItems(model.template, ctx, 0);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                 Angular code generation
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function toAngularComplete(model: ComponentRenderModel): string {
  const states = model.states ?? {};
  const stateNames = getReferencedStates(model.template, model.states);
  const templateTag = typeof model.template === "string"
    ? model.template
    : Array.isArray(model.template)
      ? (typeof model.template[0] !== "string" ? model.template[0].tag : "div")
      : (model.template as ComponentRenderTemplateItemNode).tag;

  // Class property declarations
  const propDecls = stateNames
    .map(name => {
      const state = states[name];
      return `  ${name} = ${literalValue(state.value)};`;
    })
    .join("\n");

  // Method declarations
  const methodDecls: string[] = [];
  if (model.events) {
    for (const [handlerName] of Object.entries(model.events)) {
      const updatedState = stateNames.find(s =>
        handlerName.toLowerCase().includes(s.toLowerCase())
      ) ?? stateNames[0];

      if (updatedState) {
        methodDecls.push(
          `  ${handlerName}(event: CustomEvent) {\n    this.${updatedState} = event.detail as typeof this.${updatedState};\n  }`
        );
      }
    }
  }

  const ctx: RenderContext = {
    states: model.states,
    framework: "angular",
    statePrefix: ""
  };
  const templateBody = renderTemplateItems(model.template, ctx, 4);

  const classParts: string[] = [];
  if (propDecls) classParts.push(propDecls);
  if (methodDecls.length) classParts.push(methodDecls.join("\n\n"));

  return `import { Component } from '@angular/core';
// Import Chameleon component
import '../../src/components/${templateTag.replace("ch-", "")}/';

@Component({
  selector: 'app-root',
  template: \`
${templateBody}
  \`,
  standalone: true
})
export class AppComponent {
${classParts.join("\n\n")}
}
`;
}

export function toAngularReduced(model: ComponentRenderModel): string {
  const ctx: RenderContext = {
    states: model.states,
    framework: "angular",
    statePrefix: ""
  };
  return renderTemplateItems(model.template, ctx, 0);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                      Public API
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export type Framework = "Lit" | "React" | "Angular";
export type CodeView = "reduced" | "complete";

export function generateCode(
  model: ComponentRenderModel,
  framework: Framework,
  view: CodeView
): string {
  if (framework === "Lit") {
    return view === "reduced" ? toLitReduced(model) : toLitComplete(model);
  }
  if (framework === "React") {
    return view === "reduced" ? toReactReduced(model) : toReactComplete(model);
  }
  // Angular
  return view === "reduced" ? toAngularReduced(model) : toAngularComplete(model);
}
