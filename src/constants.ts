export enum OrderBy {
  Depender,
  Dependee,
}

export const DEFAULT_VALUE = Object.freeze({
  orderBy: OrderBy.Dependee,
  debug: false,
  verbose: false,
  ignore: [],
  runOnlyOnRootDependencies: false,
  findSolutions: false,
  install: false,
});
