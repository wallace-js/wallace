import "source-map-support/register.js"; // Ensures correct line numbers in stack traces.

import * as constants from "./constants";
import { wallaceConfig } from "./config";
import { Directive, NodeValue } from "./models";
import { wallacePlugin } from "./visitors/main";

export default wallacePlugin;
/**
 * These exports are for custom plugin development.
 */
export { wallaceConfig, Directive, NodeValue, constants };
