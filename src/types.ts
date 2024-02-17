/* v8 ignore next 999 */

import { OrderBy } from "./constants";

export interface CliOptions {
  help?: boolean;
  verbose: boolean;
  debug: boolean;
  ignore: string[];
  runOnlyOnRootDependencies: boolean;
  orderBy: OrderBy;
  findSolutions: boolean;
  install: boolean;
  includePrerelease: boolean;
}
