import path from "node:path";
import fse from "fs-extra";
import resolve from "resolve";
import type { CliOptions } from "../types";
import { getPackageMeta } from "./dependencies";
import { resolvePackageDir } from "./resolver";

import type { DependencyWalkVisitor, Dependency } from "./types";

export function walkPackageDependencyTree(
  packagePath: string,
  isAncestorDevDependency: boolean,
  visitor: DependencyWalkVisitor,
  visitedPaths: string[],
  options: CliOptions,
) {
  const isRootPackage = visitedPaths.length === 0;

  if (visitedPaths.includes(packagePath)) {
    return;
  }
  visitedPaths.push(packagePath);

  const packageJsonPath = path.join(packagePath, "package.json");

  if (!fse.existsSync(packageJsonPath)) {
    throw new Error(`package.json missing at ${packageJsonPath}.`);
  }

  const packageJson = fse.readJsonSync(packageJsonPath);
  const packageDependencies = getPackageMeta(
    packagePath,
    packageJson,
    isAncestorDevDependency,
  );

  if (options.debug) {
    console.log(packageJsonPath);
    for (const dep of packageDependencies.peerDependencies) {
      console.log(dep);
    }
  }

  visitor(packagePath, packageJson, packageDependencies);

  function walkDependency(
    dependency: Dependency,
    isAncestorDevDependency: boolean,
  ) {
    if (resolve.isCore(dependency.name)) {
      return;
    }

    const dependencyPath = resolvePackageDir(packagePath, dependency.name);

    if (!dependencyPath) {
      if (
        packageDependencies.optionalDependencies.some(
          (x) => x.name === dependency.name,
        )
      ) {
        // don't fail if the missing dependency is in optionalDependencies
        if (options.debug) {
          console.log(
            `Ignoring missing optional dependency ${dependency.name} from ${packagePath}`,
          );
        }
        return;
      } else {
        throw new Error(
          `WARN: Unable to resolve package ${dependency.name} from ${packagePath}`,
        );
      }
    }

    walkPackageDependencyTree(
      dependencyPath,
      isAncestorDevDependency,
      visitor,
      visitedPaths,
      options,
    );
  }

  let dependenciesToWalk: Dependency[] = [];
  if (isRootPackage) {
    dependenciesToWalk = packageDependencies.devDependencies;
  } else if (!options.runOnlyOnRootDependencies) {
    dependenciesToWalk = packageDependencies.dependencies;
  }

  for (const dep of dependenciesToWalk) {
    walkDependency(dep, isRootPackage || isAncestorDevDependency);
  }
}
