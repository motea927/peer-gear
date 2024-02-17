import { describe, it, vi, expect } from "vitest";
import { DEFAULT_VALUE } from "../constants";
import { walkPackageDependencyTree } from "./dependencyWalker";

const mocks = vi.hoisted(() => {
  return {
    readJsonSync: vi.fn(),
    existsSync: vi.fn(),
    join: vi.fn(),
  };
});

vi.mock("fs-extra", () => {
  return {
    default: {
      readJsonSync: mocks.readJsonSync,
      existsSync: mocks.existsSync,
      join: mocks.join,
    },
  };
});

describe("walkPackageDependencyTree", () => {
  it("early return if packagePath is already visited", () => {
    const visitor = vi.fn();
    const options = {
      ...DEFAULT_VALUE,
      debug: false,
      runOnlyOnRootDependencies: false,
    };

    walkPackageDependencyTree(
      "/test-package",
      false,
      visitor,
      ["/test-package"],
      options,
    );

    expect(visitor).toHaveBeenCalledTimes(0);
  });

  it("throw error if package.json is missing", () => {
    const visitor = vi.fn();
    const options = {
      ...DEFAULT_VALUE,
      debug: false,
      runOnlyOnRootDependencies: false,
    };

    vi.mocked(mocks.existsSync).mockReturnValueOnce(false);

    expect(() => {
      walkPackageDependencyTree("/test-package", false, visitor, [], options);
    }).toThrowError("package.json missing at /test-package/package.json.");
  });

  it("should visit each package in the dependency tree", () => {
    const mockPackageJson = {
      name: "test-package",
      version: "1.0.0",
      dependencies: {
        dep1: "^1.0.0",
        dep2: "^2.0.0",
      },
    };

    vi.mocked(mocks.existsSync).mockReturnValueOnce(true);
    vi.mocked(mocks.readJsonSync).mockReturnValueOnce(mockPackageJson);
    vi.mocked(mocks.join).mockImplementation((...args) => args.join("/"));

    const visitor = vi.fn();
    const options = {
      ...DEFAULT_VALUE,
      debug: false,
      runOnlyOnRootDependencies: false,
    };

    walkPackageDependencyTree("/test-package", false, visitor, [], options);

    expect(visitor).toHaveBeenCalledTimes(1);
    expect(visitor).toHaveBeenCalledWith(
      "/test-package",
      mockPackageJson,
      expect.anything(),
    );
  });
});
