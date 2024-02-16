import type { Dependency } from "../packageUtils";

function reportPeerDependencyStatus(
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
