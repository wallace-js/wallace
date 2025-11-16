import { Directive } from "./models";
import { builtinDirectives } from "./directives";

interface GleekitOptions {
  directives?: Array<typeof Directive>;
}

class WallaceConfig {
  directives: { [key: string]: typeof Directive } = {};
  #loaded: boolean = false;
  applyOptions(options: GleekitOptions) {
    if (this.#loaded) {
      return;
    }
    if (options.directives) {
      this.addDirectives(options.directives);
    }
    this.#loaded = true;
  }
  addDirectives(directives: Array<typeof Directive>) {
    for (const directiveClass of directives) {
      const attributeName = directiveClass.attributeName;
      if (attributeName === undefined) {
        throw new Error(
          `"Directive class "${directiveClass.name}" must have an attributName.`,
        );
      }
      if (this.directives.hasOwnProperty(attributeName)) {
        console.debug(
          `Overriding directive ${attributeName} with ${directiveClass}.`,
        );
      }
      this.directives[attributeName] = directiveClass;
    }
  }
}

export const wallaceConfig = new WallaceConfig();

wallaceConfig.addDirectives(builtinDirectives);
