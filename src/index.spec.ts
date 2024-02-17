import { describe, it, expect } from "vitest";
import { DEFAULT_VALUE } from "./constants";
import { getCliArgv } from "./index";

describe("index.ts", () => {
  it("all options has default value", () => {
    const argv = getCliArgv();
    expect(argv).toMatchObject(DEFAULT_VALUE);
  });
});
