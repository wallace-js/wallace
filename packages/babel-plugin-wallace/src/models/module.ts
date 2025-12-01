import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type { ImportSpecifier, Program } from "@babel/types";
import { IMPORTABLES } from "../constants";

function addImportStatement(path: NodePath<Program>, name: string, source: string) {
  const specifier = t.importSpecifier(t.identifier(name), t.identifier(name));
  const importStatement = t.importDeclaration([specifier], t.stringLiteral(source));
  path.unshiftContainer("body", importStatement);
}

export class Module {
  path: NodePath<Program>;
  existingImports: Set<string>;
  requestedImports: Set<string>;
  constructor(path: NodePath<Program>) {
    this.path = path;
    this.existingImports = new Set();
    this.requestedImports = new Set();
  }
  foundImport(path: NodePath<ImportSpecifier>) {
    const imported = path.node.imported;
    const parent = path.parent;
    const name = t.isIdentifier(imported) ? imported.name : imported.value;
    const source = t.isImportDeclaration(parent) ? parent.source.value : undefined;
    if (source === "wallace") {
      this.existingImports.add(name);
    }
  }
  requireImport(name: IMPORTABLES) {
    this.requestedImports.add(name);
  }
  addMissingImports() {
    this.requestedImports.forEach(entry => {
      if (!this.existingImports.has(entry)) {
        addImportStatement(this.path, entry, "wallace");
        this.existingImports.add(entry);
      }
    });
  }
}
