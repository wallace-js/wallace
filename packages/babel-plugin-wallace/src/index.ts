import "source-map-support/register"; // ensures correct line numbers in stack traces.

import type { NodePath, PluginObj, PluginPass } from "@babel/core";
import type { Program } from "@babel/types";
import type { Babel } from "./babel-types";

import * as constants from "./constants";
import { wallaceConfig } from "./config";
import { Directive, NodeValue } from "./models";
import { Module } from "./models/module";
import { programVisitors } from "./visitors/program";
import { removeCtrl } from "./visitors/library";

// The general pattern involves visting high-level nodes where we instantiate models
// which are passed to traverse calls with sets of visitors for low-level nodes,
// which do some of their own transformations and call helper methods to add state.
// The higher level nodes may then use the helpers with their collected state after
// the nested traversal.
//
// This avoids the use of global state which would be necessary if visitors were
// all in the same set.

export default function wallacePlugin({ types: t }: Babel): PluginObj {
  return {
    visitor: {
      Program: {
        enter(path: NodePath<Program>, pluginPass: PluginPass) {
          wallaceConfig.applyOptions(pluginPass.opts);
          const module = new Module(path);
          //@ts-ignore
          const filename = path.hub.file.opts.filename as string;
          if (filename.includes("/wallace/lib/")) {
            if (!wallaceConfig.flags.useControllers) {
              path.traverse(removeCtrl, { module });
            }
          }
          path.traverse(programVisitors, { module });
          module.addMissingImports();
        }
      }
    }
  };
}

/**
 * These exports are for custom plugin development.
 */
export { wallaceConfig, Directive, NodeValue, constants };
