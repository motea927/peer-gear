import { Dependency } from "./packageUtils";

export interface Resolution {
  problem: Dependency;
  resolution: string;
  resolutionType: "upgrade" | "install" | "devInstall";
}
