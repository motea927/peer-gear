import type { Resolution } from "./solution";

function filterAndJoin(
  resolutions: Resolution[],
  resolutionType: string,
): string {
  const filteredResolutions = resolutions
    .filter((r) => r.resolution && r.resolutionType === resolutionType)
    .map((r) => r.resolution);

  return filteredResolutions.join(" ");
}

export function getCommandLines(resolutions: Resolution[]): string[] {
  const installs = filterAndJoin(resolutions, "install");
  const devInstalls = filterAndJoin(resolutions, "devInstall");
  const upgrades = filterAndJoin(resolutions, "upgrade");

  const installCommand = installs ? `yarn add ${installs}` : "";
  const devInstallCommand = devInstalls ? `yarn add -D ${devInstalls}` : "";
  const upgradesCommand = upgrades ? `yarn upgrade ${upgrades}` : "";

  const commands = [installCommand, devInstallCommand, upgradesCommand].filter(
    Boolean,
  );

  return commands;
}
