import { execSync } from "node:child_process";
import semver from "semver";
import {
  gatherPeerDependencies,
  getInstalledVersion,
  isSameDep,
} from "../packageUtils";

import type { Resolution } from "../solution";
import type { Dependency } from "../packageUtils";
import type { CliOptions } from "../types";

function getAllNestedPeerDependencies(options: CliOptions): Dependency[] {
  const gatheredDependencies = gatherPeerDependencies(".", options);

  function applySemverInformation(dep: Dependency): Dependency {
    const installedVersion = getInstalledVersion(dep) ?? "";
    const semverSatisfies = installedVersion
      ? semver.satisfies(installedVersion, dep.version, {
          includePrerelease: true,
        })
      : false;
    const isYalc = !!/-[\da-f]+-yalc$/.test(installedVersion);

    return { ...dep, installedVersion, semverSatisfies, isYalc };
  }

  function applyIgnoreInformation(dep: Dependency): Dependency {
    const isIgnored = options.ignore.includes(dep.name);
    return { ...dep, isIgnored };
  }

  return gatheredDependencies
    .map((element) => applySemverInformation(element))
    .map((element) => applyIgnoreInformation(element));
}

function report(options: CliOptions, allNestedPeerDependencies: Dependency[]) {
  if (options.orderBy === "depender") {
    allNestedPeerDependencies.sort((a, b) =>
      `${a.depender}${a.name}`.localeCompare(`${b.depender}${b.name}`),
    );
  } else if (options.orderBy == "dependee") {
    allNestedPeerDependencies.sort((a, b) =>
      `${a.name}${a.depender}`.localeCompare(`${b.name}${b.depender}`),
    );
  }

  for (const dep of allNestedPeerDependencies) {
    const relatedPeerDeps = allNestedPeerDependencies.filter(
      (other) => other.name === dep.name && other !== dep,
    );
    const showIfSatisfied =
      options.verbose || relatedPeerDeps.some((dep) => isProblem(dep));
    reportPeerDependencyStatus(
      dep,
      options.orderBy === "depender",
      showIfSatisfied,
      options.verbose,
    );
  }
}
