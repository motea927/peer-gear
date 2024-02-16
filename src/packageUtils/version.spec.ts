import { describe, it, expect, vi } from "vitest";
import { getInstalledVersion } from "./version";
import type { Dependency } from "./types";

const mocks = vi.hoisted(() => {
  return {
    resolvePackageDir: vi.fn(),
    readJSONSync: vi.fn(),
    existsSync: vi.fn(),
  };
});

vi.mock("./resolver", () => {
  return {
    resolvePackageDir: mocks.resolvePackageDir,
  };
});

vi.mock("fs-extra", () => {
  return {
    default: {
      readJSONSync: mocks.readJSONSync,
      existsSync: mocks.existsSync,
    },
  };
});

describe("getInstalledVersion", () => {
  it("returns undefined when resolvePackageDir does not return a path", () => {
    const result = getInstalledVersion({ name: "dep" } as Dependency);
    expect(result).toBeUndefined();
  });

  it("returns the package version when the yalc.sig file does not exist", () => {
    const version = "1.0.0";
    vi.mocked(mocks.resolvePackageDir).mockReturnValueOnce("packageDir");
    vi.mocked(mocks.readJSONSync).mockReturnValueOnce({ version });
    vi.mocked(mocks.existsSync).mockReturnValueOnce(false);

    const result = getInstalledVersion({ name: "dep" } as Dependency);

    expect(result).toBe(version);
  });

  it("returns the package version with -yalc when the yalc.sig file exists", () => {
    const version = "1.0.0";
    vi.mocked(mocks.resolvePackageDir).mockReturnValueOnce("packageDir");
    vi.mocked(mocks.readJSONSync).mockReturnValueOnce({ version });
    vi.mocked(mocks.existsSync).mockReturnValueOnce(true);

    const result = getInstalledVersion({ name: "dep" } as Dependency);
    expect(result).toBe(`${version}-yalc`);
  });
});
