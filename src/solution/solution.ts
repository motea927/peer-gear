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

function findPossibleResolution(
  _packageName: string,
  _allPeerDeps: Dependency[],
) {
  // todo
  return "";
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
