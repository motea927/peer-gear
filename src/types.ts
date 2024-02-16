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
}
