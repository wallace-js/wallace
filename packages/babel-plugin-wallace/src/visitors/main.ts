import type { NodePath, PluginObj, PluginPass } from "@babel/core";
import type { Program } from "@babel/types";
import type { Babel } from "../babel-types";
import { wallaceConfig } from "../config";
import { Module } from "../models/module";
import { programVisitors } from "./program";
import { flagVisitor, flattenUpdate } from "./library";

// The general pattern involves visting high-level nodes where we instantiate models
// which are passed to traverse calls with sets of visitors for low-level nodes,
// which do some of their own transformations and call helper methods to add state.
// The higher level nodes may then use the helpers with their collected state after
// the nested traversal.
//
// This avoids the use of global state which would be necessary if visitors were
// all in the same set.

export function wallacePlugin({ types: t }: Babel): PluginObj {
  return {
    visitor: {
      Program: {
        enter(path: NodePath<Program>, pluginPass: PluginPass) {
          wallaceConfig.applyOptions(pluginPass.opts);
          const module = new Module(path);
          //@ts-ignore
          const filename = path.hub.file.opts.filename as string;
          if (
            filename &&
            (filename.includes("/wallace/lib/") || filename.includes("/wallace/tests/"))
          ) {
            path.traverse(flagVisitor, { module });
            if (!wallaceConfig.flags.allowParts) {
              path.traverse(flattenUpdate, { module });
            }
          }
          path.traverse(programVisitors, { module });
          module.addMissingImports();
        }
      }
    }
  };
}
