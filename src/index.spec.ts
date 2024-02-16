import { describe, it, expect } from "vitest";
import { OrderBy } from "./constants";
import { getCliArgv } from "./index";

describe("index.ts", () => {
  it("all options has default value", () => {
    const argv = getCliArgv();
    expect(argv).toMatchObject({
      orderBy: OrderBy.Dependee,
      debug: false,
      verbose: false,
      ignore: [],
      runOnlyOnRootDependencies: false,
      findSolutions: false,
      install: false,
    });
  });
});
