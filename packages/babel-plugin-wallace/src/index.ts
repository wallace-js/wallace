import "source-map-support/register.js"; // Ensures correct line numbers in stack traces.

import * as constants from "./constants";
export { wallaceConfig } from "./config";
export { Directive, NodeValue, QualifierMode, ValueMode } from "./models";
import { wallacePlugin } from "./visitors/main";

export default wallacePlugin;
export { constants };
