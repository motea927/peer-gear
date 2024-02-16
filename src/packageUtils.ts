export type DependencyType =
  | "dependencies"
  | "devDependencies"
  | "peerDependencies"
  | "optionalDependencies";

export interface Dependency {
  name: string;
  version: string;
  depender: PackageMeta;
  type: DependencyType;
  isPeerOptionalDependency: boolean;
  isPeerDevDependency: boolean;
  installedVersion?: string | undefined;
  semverSatisfies?: boolean;
  isYalc?: boolean;
  isIgnored?: boolean;
}

interface PackageMeta {
  name: string;
  version: string;
  packagePath: string;
  dependencies: Dependency[];
  devDependencies: Dependency[];
  optionalDependencies: Dependency[];
  peerDependencies: Dependency[];
}
