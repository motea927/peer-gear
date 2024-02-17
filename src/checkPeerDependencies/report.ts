import type { Dependency } from "../packageUtils";
import { OrderBy } from "../constants";
import type { CliOptions } from "../types";
import { isProblem } from "./peerDependencies";

export function reportPeerDependencyStatus(
  dep: Dependency,
  byDepender: boolean,
  showSatisfiedDep: boolean,
  verbose: boolean,
) {
  const message = byDepender
    ? `${dep.depender.name}@${dep.depender.version} requires ${dep.name} ${dep.version}`
    : `${dep.name} ${dep.version} is required by ${dep.depender.name}@${dep.depender.version}`;

  const logMessage = (icon: string, suffix: string) => {
    console.log(`  ${icon}  ${message} ${suffix}`);
  };

  if (dep.semverSatisfies && showSatisfiedDep) {
    return logMessage("✅", `(${dep.installedVersion} is installed)`);
  }

  if (dep.isYalc) {
    return logMessage("☑️", `(${dep.installedVersion} is installed via yalc)`);
  }

  if (dep.isIgnored && verbose) {
    return logMessage("☑️", `IGNORED (${dep.name} is not installed)`);
  }

  if (dep.installedVersion) {
    const suffix = dep.isPeerOptionalDependency
      ? `OPTIONAL (${dep.installedVersion} is installed)`
      : `(${dep.installedVersion} is installed)`;
    return logMessage("❌", suffix);
  }

  if (dep.isPeerOptionalDependency && verbose) {
    return logMessage("☑️", `OPTIONAL (${dep.name} is not installed)`);
  }

  return logMessage("❌", `(${dep.name} is not installed)`);
}

export function sortDependencies(
  allNestedPeerDependencies: Dependency[],
  orderBy: OrderBy,
) {
  const allNestedPeerDependenciesCopy = [...allNestedPeerDependencies];
  if (orderBy === OrderBy.Depender) {
    allNestedPeerDependenciesCopy.sort((a, b) =>
      a.depender.name.localeCompare(b.depender.name),
    );
  } else if (orderBy === OrderBy.Dependee) {
    allNestedPeerDependenciesCopy.sort((a, b) => a.name.localeCompare(b.name));
  }
  return allNestedPeerDependenciesCopy;
}

export function report(
  options: CliOptions,
  allNestedPeerDependencies: Dependency[],
) {
  const sortedDependencies = sortDependencies(
    allNestedPeerDependencies,
    options.orderBy,
  );

  for (const dep of sortedDependencies) {
    const relatedPeerDeps = sortedDependencies.filter(
      (other) => other.name === dep.name && other !== dep,
    );
    const showIfSatisfied =
      options.verbose || relatedPeerDeps.some((dep) => isProblem(dep));

    reportPeerDependencyStatus(
      dep,
      options.orderBy === OrderBy.Depender,
      showIfSatisfied,
      options.verbose,
    );
  }
}
