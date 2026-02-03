import type { NodePath } from "@babel/core";
import { ERROR_MESSAGES, error } from "./errors";
import { Directive } from "./models";
import { builtinDirectives } from "./directives";

export enum FlagValue {
  useControllers = "useControllers",
  useMethods = "useMethods",
  useStubs = "useStubs"
}

type Flag = Record<FlagValue, boolean>;

interface WallaceOptions {
  directives?: Array<typeof Directive>;
  flags?: Flag;
}

const DefaultFlags: Flag = {
  useControllers: false,
  useMethods: false,
  useStubs: false
};

class WallaceConfig {
  directives: { [key: string]: typeof Directive } = {};
  flags: Flag;
  #loaded: boolean = false;
  applyOptions(options: WallaceOptions) {
    if (this.#loaded) {
      return;
    }
    if (options.directives) {
      this.addDirectives(options.directives);
    }
    this.applyFlags(options.flags);
    this.#loaded = true;
  }
  addDirectives(directives: Array<typeof Directive>) {
    for (const directiveClass of directives) {
      const attributeName = directiveClass.attributeName;
      if (attributeName === undefined) {
        throw new Error(
          `"Directive class "${directiveClass.name}" must have an attributName.`
        );
      }
      if (this.directives.hasOwnProperty(attributeName)) {
        console.debug(`Overriding directive ${attributeName} with ${directiveClass}.`);
      }
      this.directives[attributeName] = directiveClass;
    }
  }
  applyFlags(suppliedFlags: Flag | undefined) {
    if (suppliedFlags) {
      for (const [flag, value] of Object.entries(suppliedFlags)) {
        if (!DefaultFlags.hasOwnProperty(flag)) {
          throw new Error(`Unknown flag ${flag} in supplied flags.`);
        }
      }
    }
    this.flags = Object.assign({}, DefaultFlags, suppliedFlags);
  }
  ensureFlagIstrue(path: NodePath<any>, flag: FlagValue) {
    if (!this.flags[flag]) {
      error(path, ERROR_MESSAGES.FLAG_REQUIRED(String(flag)));
    }
  }
}

export const wallaceConfig = new WallaceConfig();

wallaceConfig.addDirectives(builtinDirectives);
