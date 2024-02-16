import { describe, it, expect } from "vitest";
import { getCommandLines } from "./packageManager";

import type { Resolution } from "./solution";

describe("getCommandLines", () => {
  it("should return correct command lines", () => {
    const resolutions = [
      { resolution: "package1", resolutionType: "install" },
      { resolution: "package2", resolutionType: "devInstall" },
      { resolution: "package3", resolutionType: "upgrade" },
      { resolution: "package4", resolutionType: "install" },
    ];

    // this function not care resolutions[].problem, so we can us as Resolution[]
    const result = getCommandLines(resolutions as Resolution[]);

    expect(result).toEqual([
      "yarn add package1 package4",
      "yarn add -D package2",
      "yarn upgrade package3",
    ]);
  });

  it("should return empty array if no resolutions", () => {
    const resolutions: Resolution[] = [];

    const result = getCommandLines(resolutions);

    expect(result).toHaveLength(0);
  });
});
