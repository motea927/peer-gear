import resolve from "resolve";
import type { SyncOpts } from "resolve";

interface PackageJson {
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

interface PackageMeta {
  name: string;
  version: string;
  packagePath: string;
  dependencies: Dependency[];
  devDependencies: Dependency[];
  optionalDependencies: Dependency[];
  peerDependencies: Dependency[];
}

type DependencyWalkVisitor = (
  packagePath: string,
  packageJson: PackageJson,
  packageMeta: PackageMeta,
) => void;

export function resolvePackageDir(basedir: string, packageName: string) {
  return resolvePackageDirWith(resolve.sync, basedir, packageName);
}

// for unit testing
export function resolvePackageDirWith(
  resolveSync: (packageName: string, options?: SyncOpts) => void,
  basedir: string,
  packageName: string,
) {
  let packagePath: string | undefined;

  // In resolve() v2.x this callback has a different signature
  // function packageFilter(pkg, pkgfile, pkgdir) {
  function packageFilter(pkg: Record<string, any>, pkgdir: string) {
    if (!packagePath || pkg.version) {
      packagePath = pkgdir;
    }
    return pkg;
  }

  try {
    resolveSync(packageName, { basedir, packageFilter });
  } catch {
    // resolve.sync throws if no main: is present
    // Some packages (such as @types/*) do not have a main
    // As long as we have a packagePath, it's fine
  }

  // noinspection JSUnusedAssignment
  return packagePath;
}
