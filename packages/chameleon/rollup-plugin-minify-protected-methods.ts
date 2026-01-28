// src/plugins/minify-protected-transformer.ts
import * as ts from "typescript";

// Arreglar el minificador de Event y Watch para que solo aplique a esos nodos y no a otros que tengan protected.

// Considerar usar private en lugar de protected.

// ¿Hacer skip de nodos que tengan override?

interface MinificationContext {
  protectedMethods: Map<string, string>;
  protectedEventProperties: Map<string, string>; // Only protected events
  regularProperties: Set<string>; // Properties @property that MUST NOT be minified
  usedNames: Set<string>;
  counter: number;
}

const EVENT_PREFIX = "_e";
const METHOD_PREFIX = "_m";

function generateMinifiedName(
  context: MinificationContext,
  prefix: string = ""
): string {
  let name: string;
  do {
    name = prefix + context.counter.toString(36);
    context.counter++;
  } while (context.usedNames.has(name) || isReservedName(name));

  context.usedNames.add(name);
  return name;
}

function isReservedName(name: string): boolean {
  const reserved = new Set([
    "constructor",
    "prototype",
    "length",
    "name",
    "toString",
    "valueOf",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "render",
    "connectedCallback",
    "disconnectedCallback",
    "attributeChangedCallback",
    "adoptedCallback",
    "update",
    "updated",
    "firstUpdated",
    "willUpdate",
    "requestUpdate",
    "updateComplete",
    "performUpdate",
    "shouldUpdate",
    "willUpdate",
    "getUpdateComplete"
  ]);
  return reserved.has(name);
}

function hasDecorator(node: ts.Node, decoratorName: string): boolean {
  if (!ts.canHaveDecorators(node)) {
    return false;
  }

  const decorators = ts.getDecorators(node);
  if (!decorators) {
    return false;
  }

  return decorators.some(decorator => {
    if (ts.isCallExpression(decorator.expression)) {
      return (
        ts.isIdentifier(decorator.expression.expression) &&
        decorator.expression.expression.text === decoratorName
      );
    }
    return (
      ts.isIdentifier(decorator.expression) &&
      decorator.expression.text === decoratorName
    );
  });
}

function isProtectedMethod(node: ts.Node): boolean {
  return (
    ts.isMethodDeclaration(node) &&
    node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ProtectedKeyword) ===
      true
  );
}

function isProtectedEventProperty(node: ts.Node): boolean {
  return (
    (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) &&
    hasDecorator(node, "Event") &&
    node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ProtectedKeyword) ===
      true
  );
}

function isRegularProperty(node: ts.Node): boolean {
  return (
    (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) &&
    hasDecorator(node, "property")
  );
}

function collectIdentifiers(
  sourceFile: ts.SourceFile,
  context: MinificationContext
): void {
  function visit(node: ts.Node): void {
    // Collect protected methods
    if (
      isProtectedMethod(node) &&
      ts.isMethodDeclaration(node) &&
      node.name &&
      ts.isIdentifier(node.name)
    ) {
      const methodName = node.name.text;
      if (!context.protectedMethods.has(methodName)) {
        const minifiedName = generateMinifiedName(context, METHOD_PREFIX);
        context.protectedMethods.set(methodName, minifiedName);
      }
    }

    // Collect ONLY protected @Event properties
    if (isProtectedEventProperty(node)) {
      let propertyName: string | undefined;

      if (
        ts.isPropertyDeclaration(node) &&
        node.name &&
        ts.isIdentifier(node.name)
      ) {
        propertyName = node.name.text;
      } else if (
        ts.isPropertySignature(node) &&
        node.name &&
        ts.isIdentifier(node.name)
      ) {
        propertyName = node.name.text;
      }

      if (propertyName && !context.protectedEventProperties.has(propertyName)) {
        const minifiedName = generateMinifiedName(context, EVENT_PREFIX);
        context.protectedEventProperties.set(propertyName, minifiedName);
      }
    }

    // Collect @property properties (these should NOT be minified)
    if (isRegularProperty(node)) {
      let propertyName: string | undefined;

      if (
        ts.isPropertyDeclaration(node) &&
        node.name &&
        ts.isIdentifier(node.name)
      ) {
        propertyName = node.name.text;
      } else if (
        ts.isPropertySignature(node) &&
        node.name &&
        ts.isIdentifier(node.name)
      ) {
        propertyName = node.name.text;
      }

      if (propertyName) {
        context.regularProperties.add(propertyName);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function createTransformer(
  context: MinificationContext
): ts.TransformerFactory<ts.SourceFile> {
  return (transformContext: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile): ts.SourceFile => {
      function visit(node: ts.Node): ts.Node {
        // Transform protected method declarations
        if (
          isProtectedMethod(node) &&
          ts.isMethodDeclaration(node) &&
          node.name &&
          ts.isIdentifier(node.name)
        ) {
          const methodName = node.name.text;
          const minifiedName = context.protectedMethods.get(methodName);

          if (minifiedName) {
            return ts.factory.updateMethodDeclaration(
              node,
              node.modifiers,
              node.asteriskToken,
              ts.factory.createIdentifier(minifiedName),
              node.questionToken,
              node.typeParameters,
              node.parameters,
              node.type,
              node.body
            );
          }
        }

        // Transform ONLY protected @Event property declarations
        if (isProtectedEventProperty(node)) {
          let propertyName: string | undefined;
          let isPropertyDeclaration = false;

          if (
            ts.isPropertyDeclaration(node) &&
            node.name &&
            ts.isIdentifier(node.name)
          ) {
            propertyName = node.name.text;
            isPropertyDeclaration = true;
          } else if (
            ts.isPropertySignature(node) &&
            node.name &&
            ts.isIdentifier(node.name)
          ) {
            propertyName = node.name.text;
            isPropertyDeclaration = false;
          }

          if (propertyName) {
            const minifiedName =
              context.protectedEventProperties.get(propertyName);
            if (minifiedName) {
              if (isPropertyDeclaration && ts.isPropertyDeclaration(node)) {
                return ts.factory.updatePropertyDeclaration(
                  node,
                  node.modifiers,
                  ts.factory.createIdentifier(minifiedName),
                  node.questionToken,
                  node.type,
                  node.initializer
                );
              }
              if (!isPropertyDeclaration && ts.isPropertySignature(node)) {
                return ts.factory.updatePropertySignature(
                  node,
                  node.modifiers,
                  ts.factory.createIdentifier(minifiedName),
                  node.questionToken,
                  node.type
                );
              }
            }
          }
        }

        // Transform method calls and property accesses
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression)
        ) {
          const propertyName = node.expression.name.text;
          const minifiedMethodName = context.protectedMethods.get(propertyName);

          if (minifiedMethodName) {
            return ts.factory.updateCallExpression(
              node,
              ts.factory.updatePropertyAccessExpression(
                node.expression,
                node.expression.expression,
                ts.factory.createIdentifier(minifiedMethodName)
              ),
              node.typeArguments,
              node.arguments
            );
          }
        }

        // Transform property access expressions
        if (ts.isPropertyAccessExpression(node)) {
          const propertyName = node.name.text;

          // Check for protected method access
          const minifiedMethodName = context.protectedMethods.get(propertyName);
          if (minifiedMethodName) {
            return ts.factory.updatePropertyAccessExpression(
              node,
              node.expression,
              ts.factory.createIdentifier(minifiedMethodName)
            );
          }

          // Check for protected event property access ONLY
          const minifiedEventName =
            context.protectedEventProperties.get(propertyName);
          if (minifiedEventName) {
            return ts.factory.updatePropertyAccessExpression(
              node,
              node.expression,
              ts.factory.createIdentifier(minifiedEventName)
            );
          }

          // DO NOT transform @property properties or non-protected @Event properties
        }

        // Transform @Observe decorator arguments - but only for protected @Event properties
        if (
          ts.isDecorator(node) &&
          ts.isCallExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === "Watch"
        ) {
          const args = node.expression.arguments;
          if (args.length > 0 && ts.isStringLiteral(args[0])) {
            const watchedProperty = args[0].text;

            // Only minify the @Observe argument if it's a protected @Event property
            // Regular @property properties and non-protected @Event properties should keep their original names
            const minifiedEventName =
              context.protectedEventProperties.get(watchedProperty);
            if (minifiedEventName) {
              return ts.factory.updateDecorator(
                node,
                ts.factory.updateCallExpression(
                  node.expression,
                  node.expression.expression,
                  node.expression.typeArguments,
                  [
                    ts.factory.createStringLiteral(minifiedEventName),
                    ...args.slice(1)
                  ]
                )
              );
            }
            // If it's a regular @property or non-protected @Event, leave the @Observe argument unchanged
          }
        }

        return ts.visitEachChild(node, visit, transformContext);
      }

      return ts.visitNode(sourceFile, visit) as ts.SourceFile;
    };
  };
}

export function createMinifyProtectedTransformer(): {
  type: "program";
  factory: (program: ts.Program) => ts.TransformerFactory<ts.SourceFile>;
} {
  return {
    type: "program",
    factory: (program: ts.Program) => {
      const context: MinificationContext = {
        protectedMethods: new Map(),
        protectedEventProperties: new Map(), // Solo eventos protected
        regularProperties: new Set(),
        usedNames: new Set(),
        counter: 0
      };

      // Collect all identifiers from all source files
      for (const sourceFile of program.getSourceFiles()) {
        if (
          !sourceFile.isDeclarationFile &&
          !sourceFile.fileName.includes("node_modules")
        ) {
          collectIdentifiers(sourceFile, context);
        }
      }

      // Create transformer with collected context
      return createTransformer(context);
    }
  };
}

