import type { CliOptions } from "../types";
import { walkPackageDependencyTree } from "./dependencyWalker";

import type {
  Dependency,
  PackageJson,
  PackageMeta,
  DependencyWalkVisitor,
} from "./types";

export function buildDependencyArray(
  type: Dependency["type"],
  pkgJson: PackageJson,
  depender: PackageMeta,
  isAncestorDevDependency: boolean,
): Dependency[] {
  const dependenciesObject = pkgJson[type] || {};
  const peerDependenciesMeta = pkgJson.peerDependenciesMeta || {};
  // backwards compat
  const peerDevDependencies = pkgJson.peerDevDependencies || [];

  const packageNames = Object.keys(dependenciesObject);

  return packageNames.map((name) => {
    const isPeerOptionalDependency = !!peerDependenciesMeta[name]?.optional;
    const isPeerDevDependency =
      isAncestorDevDependency ||
      !!peerDependenciesMeta[name]?.dev ||
      !!peerDevDependencies.includes(name);

    return {
      name,
      type,
      version: dependenciesObject[name],
      isPeerDevDependency,
      isPeerOptionalDependency,
      depender,
    };
  });
}

export function getPackageMeta(
  packagePath: string,
  packageJson: PackageJson,
  isAncestorDevDependency: boolean,
): PackageMeta {
  const { name, version } = packageJson;
  const packageMeta: PackageMeta = {
    name,
    version,
    packagePath,
    dependencies: [],
    devDependencies: [],
    optionalDependencies: [],
    peerDependencies: [],
  };

  const dependencyTypes: Array<Dependency["type"]> = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ];

  for (const type of dependencyTypes) {
    packageMeta[type] = buildDependencyArray(
      type,
      packageJson,
      packageMeta,
      isAncestorDevDependency,
    );
  }

  return packageMeta;
}

export function gatherPeerDependencies(
  packagePath: string,
  options: CliOptions,
): Dependency[] {
  let peerDeps: Dependency[] = [];
  const visitor: DependencyWalkVisitor = (_path, _json, deps) => {
    peerDeps = [...peerDeps, ...deps.peerDependencies];
  };
  walkPackageDependencyTree(packagePath, false, visitor, [], options);

  const uniqueDeps: Dependency[] = [];
  for (const peerDep of peerDeps) {
    if (!uniqueDeps.some((dep2) => isSameDep(peerDep, dep2))) {
      uniqueDeps.push(peerDep);
    }
  }
  return uniqueDeps;
}

export function isSameDep(a: Dependency, b: Dependency) {
  const keys: Array<keyof Dependency> = [
    "name",
    "version",
    "installedVersion",
    "semverSatisfies",
    "isYalc",
    "isPeerDevDependency",
  ];

  return (
    keys.every((key) => a[key] === b[key]) &&
    a.depender.name === b.depender.name &&
    a.depender.version === b.depender.version &&
    a.depender.packagePath === b.depender.packagePath
  );
}
