import { execSync } from "node:child_process";
import semver from "semver";
import type { Dependency } from "../packageUtils/types";

export interface Resolution {
  problem: Dependency;
  resolution: string;
  resolutionType: "upgrade" | "install" | "devInstall";
}

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

function semverReverseSort(a: string, b: string) {
  const lt = semver.lt(a, b);
  const gt = semver.gt(a, b);
  if (!lt && !gt) {
    return 0;
  } else if (lt) {
    return 1;
  }
  return -1;
}

function findPossibleResolution(
  packageName: string,
  allPeerDeps: Dependency[],
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
          includePrerelease: true,
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
): string {
  return findPossibleResolution(problem.name, allPeerDependencies);
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
): Resolution[] {
  const uniqProblems = getUniqueProblems(problems);

  return uniqProblems.map((problem) => {
    const resolutionType = determineResolutionType(problem);
    const resolutionVersion = determineResolutionVersion(
      problem,
      allPeerDependencies,
    );
    const resolution = formatResolution(problem, resolutionVersion);
    return { problem, resolution, resolutionType } as Resolution;
  });
}
