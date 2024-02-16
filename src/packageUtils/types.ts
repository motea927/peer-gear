export interface PackageJson {
  name: string;
  version: string;
  dependencies: {
    [key: string]: string;
  };
  devDependencies: {
    [key: string]: string;
  };
  peerDependencies: {
    [key: string]: string;
  };
  // deprecated: use peerDependenciesMeta.foo.dev
  peerDevDependencies: string[];
  // See: https://github.com/yarnpkg/rfcs/blob/master/accepted/0000-optional-peer-dependencies.md
  peerDependenciesMeta: {
    [key: string]: {
      optional?: boolean;
      // non-standard
      dev?: boolean;
    };
  };
  optionalDependencies: {
    [key: string]: string;
  };
}

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

export interface PackageMeta {
  name: string;
  version: string;
  packagePath: string;
  dependencies: Dependency[];
  devDependencies: Dependency[];
  optionalDependencies: Dependency[];
  peerDependencies: Dependency[];
}

export type DependencyWalkVisitor = (
  packagePath: string,
  packageJson: PackageJson,
  packageMeta: PackageMeta,
) => void;
