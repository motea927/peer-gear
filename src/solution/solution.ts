import { execSync } from "node:child_process";
import semver from "semver";
import type { Dependency } from "../packageUtils/types";
import type { CliOptions } from "../types";
import type { Resolution } from "./types";

export function getUniqueProblems(problems: Dependency[]): Dependency[] {
  const uniqueNames = new Set(problems.map((problem) => problem.name));

  return [...uniqueNames].map((name) => {
    const problem = problems.find((problem) => problem.name === name);
    if (!problem) {
      throw new Error("This should never happen");
    }
    return problem;
  });
}

export function determineResolutionType(problem: Dependency): string {
  if (problem.installedVersion) {
    return "upgrade";
  }
  if (problem.isPeerDevDependency) {
    return "devInstall";
  }
  return "install";
}

export function semverReverseSort(a: string, b: string) {
  const lt = semver.lt(a, b);
  const gt = semver.gt(a, b);
  if (!lt && !gt) {
    return 0;
  } else if (lt) {
    return 1;
  }
  return -1;
}

export function findPossibleResolution(
  packageName: string,
  allPeerDeps: Dependency[],
  options: CliOptions,
) {
  const requiredPeerVersions = allPeerDeps.filter(
    (dep) => dep.name === packageName,
  );
  // todo: skip this step if only one required peer version and it's an exact version
  const command = `npm view ${packageName} versions`;
  let rawVersionsInfo;
  try {
    rawVersionsInfo = execSync(command, { stdio: "pipe" }).toString();

    const availableVersions = JSON.parse(
      rawVersionsInfo.replace(/'/g, '"'),
    ).sort(semverReverseSort);

    return availableVersions.find((ver: string) =>
      requiredPeerVersions.every((peerVer) => {
        return semver.satisfies(ver, peerVer.version, {
          includePrerelease: options.includePrerelease,
        });
      }),
    );
  } catch (error) {
    console.error(`Error while running command: '${command}'`);
    console.error(error);
    console.error();
    console.error("npm output:");
    console.error(rawVersionsInfo);
  }
}

export function determineResolutionVersion(
  problem: Dependency,
  allPeerDependencies: Dependency[],
  options: CliOptions,
): string {
  return findPossibleResolution(problem.name, allPeerDependencies, options);
}

export function formatResolution(
  problem: Dependency,
  resolutionVersion: string,
): string {
  return resolutionVersion ? `${problem.name}@${resolutionVersion}` : "";
}

export function findPossibleResolutions(
  problems: Dependency[],
  allPeerDependencies: Dependency[],
  options: CliOptions,
): Resolution[] {
  const uniqProblems = getUniqueProblems(problems);

  return uniqProblems.map((problem) => {
    const resolutionType = determineResolutionType(problem);
    const resolutionVersion = determineResolutionVersion(
      problem,
      allPeerDependencies,
      options,
    );
    const resolution = formatResolution(problem, resolutionVersion);
    return { problem, resolution, resolutionType } as Resolution;
  });
}
