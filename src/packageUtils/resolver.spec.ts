import { describe, it, expect, vi } from "vitest";
import { resolvePackageDir } from "./resolver";

const mocks = vi.hoisted(() => {
  return {
    packageFilter: vi.fn(() => ({
      filter: vi.fn(),
      getPackagePath: vi.fn(),
    })),
  };
});

vi.mock("./packageFilter", () => {
  return {
    packageFilter: mocks.packageFilter,
  };
});

describe("resolvePackageDir", () => {
  it("should return package dir", () => {
    const basedir = "/path/to/basedir";
    vi.mocked(mocks.packageFilter).mockReturnValueOnce({
      filter: vi.fn(),
      getPackagePath: vi.fn(() => basedir),
    });

    const packageName = "test-package";
    const result = resolvePackageDir(basedir, packageName);
    expect(result).toBe(basedir);
  });

  it("should return undefined if package not found", () => {
    const basedir = "/path/to/basedir";
    vi.mocked(mocks.packageFilter).mockReturnValueOnce({
      filter: vi.fn(),
      getPackagePath: vi.fn(),
    });

    const packageName = "test-package";
    const result = resolvePackageDir(basedir, packageName);
    expect(result).toBeUndefined();
  });
});
