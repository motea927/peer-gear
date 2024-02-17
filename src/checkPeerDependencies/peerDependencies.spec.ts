import { describe, it, expect, vi } from "vitest";
import { Dependency } from "../packageUtils/types";
import { DEFAULT_VALUE } from "../constants";
import {
  isProblem,
  getAllNestedPeerDependencies,
  findSolutions,
} from "./peerDependencies";

const mocks = vi.hoisted(() => {
  return {
    gatherPeerDependencies: vi.fn(),
    getInstalledVersion: vi.fn(),
    satisfies: vi.fn(),
    findPossibleResolutions: vi.fn(),
  };
});

vi.mock("../packageUtils", () => {
  return {
    gatherPeerDependencies: mocks.gatherPeerDependencies,
    getInstalledVersion: mocks.getInstalledVersion,
  };
});

vi.mock("semver", () => {
  return {
    default: {
      satisfies: mocks.satisfies,
    },
    satisfies: mocks.satisfies,
  };
});

vi.mock("../solution", () => {
  return {
    findPossibleResolutions: mocks.findPossibleResolutions,
  };
});

const defaultDependency: Dependency = {
  name: "dep1",
  type: "dependencies",
  version: "^1.0.0",
  isPeerDevDependency: false,
  isPeerOptionalDependency: false,
  depender: {
    name: "test-package",
    version: "1.0.0",
    packagePath: "/test-package",
    dependencies: [],
    devDependencies: [],
    optionalDependencies: [],
    peerDependencies: [],
  },
  semverSatisfies: false,
  installedVersion: "1.0.0",
  isYalc: false,
  isIgnored: false,
};

describe("isProblem", () => {
  it("should return true if the dependency is a problem", () => {
    const dep: Dependency = {
      ...defaultDependency,
      semverSatisfies: false,
      isIgnored: false,
      isYalc: false,
      isPeerOptionalDependency: false,
      installedVersion: undefined,
    };

    expect(isProblem(dep)).toBeTruthy();
  });

  it("should return false if the dependency is not a problem", () => {
    const dep: Dependency = {
      ...defaultDependency,
      semverSatisfies: true,
    };

    expect(isProblem(dep)).toBeFalsy();
  });
});

describe("getAllNestedPeerDependencies", () => {
  it("should return all nested peer dependencies with additional information", () => {
    const mockOptions = { ...DEFAULT_VALUE, ignore: [] };
    const mockDependencies = [
      { name: "test", version: "1.0.0" },
      { name: "test2", version: "2.0.0" },
    ];
    const mockInstalledVersion = "1.0.0";

    vi.mocked(mocks.gatherPeerDependencies).mockReturnValue(mockDependencies);
    vi.mocked(mocks.getInstalledVersion).mockReturnValue(mockInstalledVersion);
    vi.mocked(mocks.satisfies).mockReturnValue(true);

    const result = getAllNestedPeerDependencies(mockOptions);

    expect(result).toEqual([
      {
        name: "test",
        version: "1.0.0",
        installedVersion: mockInstalledVersion,
        semverSatisfies: true,
        isYalc: false,
        isIgnored: false,
      },
      {
        name: "test2",
        version: "2.0.0",
        installedVersion: mockInstalledVersion,
        semverSatisfies: true,
        isYalc: false,
        isIgnored: false,
      },
    ]);
  });
});

describe("findSolutions", () => {
  it("should return solutions and no solutions for given dependencies", () => {
    const mockProblems: Dependency[] = [
      {
        ...defaultDependency,
        name: "test",
        version: "1.0.0",
        semverSatisfies: false,
        isIgnored: false,
        isYalc: false,
        isPeerOptionalDependency: false,
        installedVersion: undefined,
      },
      {
        ...defaultDependency,
        name: "test2",
        version: "2.0.0",
        semverSatisfies: true,
        isIgnored: false,
        isYalc: false,
        isPeerOptionalDependency: false,
        installedVersion: "2.0.0",
      },
    ];
    const mockAllNestedPeerDependencies: Dependency[] = [
      {
        ...defaultDependency,
        name: "test",
        version: "1.0.0",
        semverSatisfies: false,
        isIgnored: false,
        isYalc: false,
        isPeerOptionalDependency: false,
        installedVersion: undefined,
      },
      {
        ...defaultDependency,
        name: "test2",
        version: "2.0.0",
        semverSatisfies: true,
        isIgnored: false,
        isYalc: false,
        isPeerOptionalDependency: false,
        installedVersion: "2.0.0",
      },
    ];
    const mockResolutions = [
      { problem: mockProblems[0], resolution: "1.0.0" },
      { problem: mockProblems[1], resolution: undefined },
    ];

    vi.mocked(mocks.findPossibleResolutions).mockReturnValue(mockResolutions);

    const { resolutionsWithSolutions, nosolution } = findSolutions(
      mockProblems,
      mockAllNestedPeerDependencies,
      { ...DEFAULT_VALUE },
    );

    expect(resolutionsWithSolutions).toEqual([mockResolutions[0]]);
    expect(nosolution).toEqual([mockResolutions[1]]);
  });
});
