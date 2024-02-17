import { execSync } from "node:child_process";
import semver from "semver";
import {
  gatherPeerDependencies,
  getInstalledVersion,
  isSameDep,
} from "../packageUtils";
import { findPossibleResolutions, type Resolution } from "../solution";
import { getCommandLines } from "../packageManager";

import type { Dependency } from "../packageUtils";
import type { CliOptions } from "../types";
import { report } from "./report";

export const isProblem = (dep: Dependency) =>
  !dep.semverSatisfies &&
  !dep.isIgnored &&
  !dep.isYalc &&
  (!dep.isPeerOptionalDependency || !!dep.installedVersion);

export function getAllNestedPeerDependencies(
  options: CliOptions,
): Dependency[] {
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

export function findSolutions(
  problems: Dependency[],
  allNestedPeerDependencies: Dependency[],
  options: CliOptions,
): { resolutionsWithSolutions: Resolution[]; nosolution: Resolution[] } {
  printSearchMessage(problems.length);
  const resolutions: Resolution[] = findPossibleResolutions(
    problems,
    allNestedPeerDependencies,
    options,
  );
  const resolutionsWithSolutions = getResolutionsWithSolutions(resolutions);
  const nosolution = getNoSolutionResolutions(resolutions);

  printNoSolutionErrors(nosolution, allNestedPeerDependencies);

  return { resolutionsWithSolutions, nosolution };
}

function printSearchMessage(problemCount: number): void {
  console.log();
  console.log(
    `Searching for solutions for ${problemCount} missing dependencies...`,
  );
  console.log();
}

function getResolutionsWithSolutions(resolutions: Resolution[]): Resolution[] {
  return resolutions.filter((r) => r.resolution);
}

function getNoSolutionResolutions(resolutions: Resolution[]): Resolution[] {
  return resolutions.filter((r) => !r.resolution);
}

function printNoSolutionErrors(
  nosolution: Resolution[],
  allNestedPeerDependencies: Dependency[],
): void {
  for (const solution of nosolution) {
    printSingleNoSolutionError(solution, allNestedPeerDependencies);
  }

  if (nosolution.length > 0) {
    console.error();
  }
}

function printSingleNoSolutionError(
  solution: Resolution,
  allNestedPeerDependencies: Dependency[],
): void {
  const name = solution.problem.name;
  const errorPrefix = `Unable to find a version of ${name} that satisfies the following peerDependencies:`;
  const peerDepRanges = getPeerDepRanges(name, allNestedPeerDependencies);
  console.error(`  ❌  ${errorPrefix} ${peerDepRanges.join(" and ")}`);
}

function getPeerDepRanges(
  name: string,
  allNestedPeerDependencies: Dependency[],
): string[] {
  const peerDepRanges: string[] = [];
  for (const dep of allNestedPeerDependencies) {
    if (dep.name === name && !peerDepRanges.includes(dep.version)) {
      peerDepRanges.push(dep.version);
    }
  }
  return peerDepRanges;
}

export function checkPeerDependencies(options: CliOptions): void {
  const allNestedPeerDependencies = getAllNestedPeerDependencies(options);
  report(options, allNestedPeerDependencies);

  const problems = allNestedPeerDependencies.filter((dep) => isProblem(dep));

  if (problems.length === 0) {
    console.log("  ✅  All peer dependencies are met");
    return;
  }

  if (options.install) {
    const { nosolution, resolutionsWithSolutions } = findSolutions(
      problems,
      allNestedPeerDependencies,
      options,
    );
    const commandLines = getCommandLines(resolutionsWithSolutions);

    if (commandLines.length > 0) {
      return installPeerDependencies(commandLines, options, nosolution);
    }
  } else if (options.findSolutions) {
    const { resolutionsWithSolutions } = findSolutions(
      problems,
      allNestedPeerDependencies,
      options,
    );
    const commandLines = getCommandLines(resolutionsWithSolutions);

    if (commandLines.length > 0) {
      console.log();
      console.log(
        `Install peerDependencies using ${commandLines.length > 1 ? "these commands:" : "this command"}:`,
      );
      console.log();
      for (const command of commandLines) {
        console.log(command);
      }
      console.log();
    }
  } else {
    console.log();
    console.log(`Search for solutions using this command:`);
    console.log();
    console.log(`npx check-peer-dependencies --findSolutions`);
    console.log();
    console.log(`Install peerDependencies using this command:`);
    console.log();
    console.log(`npx check-peer-dependencies --install`);
    console.log();
  }

  process.exit(1);
}

let recursiveCount = 0;
function installPeerDependencies(
  commandLines: string[],
  options: CliOptions,
  nosolution: Resolution[],
) {
  console.log("Installing peerDependencies...");
  console.log();
  for (const command of commandLines) {
    console.log(`$ ${command}`);
    execSync(command);
    console.log();
  }

  const newProblems = getAllNestedPeerDependencies(options)
    .filter((dep) => isProblem(dep))
    .filter((dep) => !nosolution.some((x) => isSameDep(x.problem, dep)));

  if (nosolution.length === 0 && newProblems.length === 0) {
    console.log("All peer dependencies are met");
  }

  if (newProblems.length > 0) {
    console.log(`Found ${newProblems.length} new unmet peerDependencies...`);
    if (++recursiveCount < 5) {
      return checkPeerDependencies(options);
    } else {
      console.error("Recursion limit reached (5)");
      process.exit(5);
    }
  }
}
