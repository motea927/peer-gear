import type { Dependency } from "./packageUtils/types";

export interface Resolution {
  problem: Dependency;
  resolution: string;
  resolutionType: "upgrade" | "install" | "devInstall";
}
