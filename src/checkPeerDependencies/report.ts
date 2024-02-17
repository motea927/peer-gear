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

  let statusIcon = "";
  let statusMessage = "";

  if (dep.semverSatisfies) {
    if (!showSatisfiedDep) {
      return;
    }
    statusIcon = "✅";
    statusMessage = `(${dep.installedVersion} is installed)`;
  } else if (dep.isYalc) {
    statusIcon = "☑️";
    statusMessage = `(${dep.installedVersion} is installed via yalc)`;
  } else if (dep.isIgnored) {
    if (!verbose) {
      return;
    }
    statusIcon = "☑️";
    statusMessage = `IGNORED (${dep.name} is not installed)`;
  } else if (dep.installedVersion) {
    statusIcon = "❌";
    statusMessage = dep.isPeerOptionalDependency
      ? `OPTIONAL (${dep.installedVersion} is installed)`
      : `(${dep.installedVersion} is installed)`;
  } else if (dep.isPeerOptionalDependency) {
    if (!verbose) {
      return;
    }
    statusIcon = "☑️";
    statusMessage = `OPTIONAL (${dep.name} is not installed)`;
  } else {
    statusIcon = "❌";
    statusMessage = `(${dep.name} is not installed)`;
  }

  console.log(`  ${statusIcon}  ${message} ${statusMessage}`);
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
