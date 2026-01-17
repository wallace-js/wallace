import { Directive } from "./models";
import { builtinDirectives } from "./directives";

enum FlagValue {
  useControllers = "useControllers",
  useStubs = "useStubs",
  useMethods = "useMethods"
}

type Flag = Record<FlagValue, boolean>;

interface WallaceOptions {
  directives?: Array<typeof Directive>;
  flags?: Flag;
}

const DefaultFlags: Flag = {
  useControllers: false,
  useStubs: false,
  useMethods: false
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
}

export const wallaceConfig = new WallaceConfig();

wallaceConfig.addDirectives(builtinDirectives);
