import ts from "typescript";
import { describe, expect, it } from "vitest";

const loaders = import.meta.glob("../src/core/**/*.ts");
const sources = import.meta.glob("../src/core/**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const FORBIDDEN_MODULE_PATTERNS = [
  /^react(\/.*)?$/,
  /^react-dom(\/.*)?$/,
  /.*\/adapters(\/.*)?$/,
  /.*\/ui(\/.*)?$/,
];

const UNAMBIGUOUS_BROWSER_GLOBALS = new Set([
  "window",
  "navigator",
  "localStorage",
  "sessionStorage",
  "HTMLElement",
  "HTMLButtonElement",
  "KeyboardEvent",
  "MouseEvent",
]);

const DOM_DOCUMENT_MEMBERS = new Set([
  "createElement",
  "getElementById",
  "querySelector",
  "querySelectorAll",
  "cookie",
  "body",
  "addEventListener",
  "removeEventListener",
]);

function extractImports(sourceFile: ts.SourceFile): string[] {
  const imports: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      if (ts.isStringLiteral(node.moduleSpecifier)) {
        imports.push(node.moduleSpecifier.text);
      }
    } else if (ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        imports.push(node.moduleSpecifier.text);
      }
    } else if (ts.isCallExpression(node)) {
      const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire = ts.isIdentifier(node.expression) && node.expression.text === "require";
      if (isDynamicImport || isRequire) {
        const arg = node.arguments[0];
        if (arg && ts.isStringLiteral(arg)) {
          imports.push(arg.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return imports;
}

function findBrowserGlobals(sourceFile: ts.SourceFile): string[] {
  const foundGlobals: string[] = [];

  function visit(node: ts.Node) {
    // Check unambiguous globals like window, navigator, etc.
    if (ts.isIdentifier(node) && UNAMBIGUOUS_BROWSER_GLOBALS.has(node.text)) {
      const parent = node.parent;
      if (!(
        (ts.isPropertyAccessExpression(parent) &&
          parent.name === node &&
          parent.expression !== node) ||
        (ts.isPropertyAssignment(parent) && parent.name === node)
      )) {
        foundGlobals.push(node.text);
      }
    }

    // Check for DOM document usage: document.querySelector, document.createElement, etc.
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "document" &&
      DOM_DOCUMENT_MEMBERS.has(node.name.text)
    ) {
      foundGlobals.push(`document.${node.name.text}`);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return foundGlobals;
}

describe("core purity AST verification", () => {
  it("loads every core module without browser globals", async () => {
    const paths = Object.keys(loaders);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      const load = loaders[path];
      expect(load, path).toBeDefined();
      await expect(load?.()).resolves.toBeDefined();
    }
  });

  it("core sources do not import React, DOM, or adapter modules (AST checked)", () => {
    const paths = Object.keys(sources);
    expect(paths.length).toBeGreaterThan(0);

    for (const path of paths) {
      const content = sources[path]!;
      const sourceFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
      const imports = extractImports(sourceFile);

      for (const specifier of imports) {
        for (const pattern of FORBIDDEN_MODULE_PATTERNS) {
          expect(pattern.test(specifier), `Forbidden module import "${specifier}" in ${path}`).toBe(
            false,
          );
        }
      }
    }
  });

  it("core sources do not reference browser globals (AST checked)", () => {
    const paths = Object.keys(sources);
    expect(paths.length).toBeGreaterThan(0);

    for (const path of paths) {
      const content = sources[path]!;
      const sourceFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
      const globals = findBrowserGlobals(sourceFile);
      expect(globals, `Forbidden browser globals referenced in ${path}`).toEqual([]);
    }
  });
});
