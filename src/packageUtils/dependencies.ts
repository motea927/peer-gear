import type { Dependency, PackageJson, PackageMeta } from "./types";

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
