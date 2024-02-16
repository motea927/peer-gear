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

export const isProblem = (dep: Dependency) =>
  !dep.semverSatisfies &&
  !dep.isIgnored &&
  !dep.isYalc &&
  (!dep.isPeerOptionalDependency || !!dep.installedVersion);

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
