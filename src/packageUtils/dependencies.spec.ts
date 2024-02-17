import { describe, it, expect, vi } from "vitest";
import { DEFAULT_VALUE } from "../constants";

import {
  buildDependencyArray,
  getPackageMeta,
  gatherPeerDependencies,
  isSameDep,
} from "./dependencies";

import type { PackageJson, PackageMeta, Dependency } from "./types";

const mocks = vi.hoisted(() => {
  return {
    walkPackageDependencyTree: vi.fn(),
  };
});

vi.mock("./dependencyWalker", () => {
  return {
    walkPackageDependencyTree: mocks.walkPackageDependencyTree,
  };
});

describe("buildDependencyArray", () => {
  it("builds an array of dependencies", () => {
    const type = "dependencies";
    const pkgJson: PackageJson = {
      name: "test",
      version: "123",
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
      dependencies: {
        dep1: "1.0.0",
        dep2: "2.0.0",
      },
      peerDependenciesMeta: {
        dep1: { optional: true },
        dep2: { dev: true },
      },
      peerDevDependencies: ["dep2"],
    };
    const depender = { name: "depender", version: "1.0.0" };
    const isAncestorDevDependency = false;

    const result = buildDependencyArray(
      type,
      pkgJson,
      depender as PackageMeta,
      isAncestorDevDependency,
    );

    expect(result).toStrictEqual([
      {
        name: "dep1",
        type: "dependencies",
        version: "1.0.0",
        isPeerDevDependency: false,
        isPeerOptionalDependency: true,
        depender: { ...depender },
      },
      {
        name: "dep2",
        type: "dependencies",
        version: "2.0.0",
        isPeerDevDependency: true,
        isPeerOptionalDependency: false,
        depender: { ...depender },
      },
    ]);
  });

  it("marks dependencies as dev dependencies if isAncestorDevDependency is true", () => {
    const type = "dependencies";
    const pkgJson = {
      dependencies: {
        dep1: "1.0.0",
        dep2: "2.0.0",
      },
      peerDependenciesMeta: {},
      peerDevDependencies: [],
    };
    const depender = { name: "depender", version: "1.0.0" };
    const isAncestorDevDependency = true;

    const result = buildDependencyArray(
      type,
      pkgJson as unknown as PackageJson,
      depender as PackageMeta,
      isAncestorDevDependency,
    );

    expect(result).toEqual([
      {
        name: "dep1",
        type: "dependencies",
        version: "1.0.0",
        isPeerDevDependency: true,
        isPeerOptionalDependency: false,
        depender,
      },
      {
        name: "dep2",
        type: "dependencies",
        version: "2.0.0",
        isPeerDevDependency: true,
        isPeerOptionalDependency: false,
        depender,
      },
    ]);
  });
});

describe("getPackageMeta", () => {
  it("returns a PackageMeta object", () => {
    const packagePath = "/path/to/package";
    const packageJson: PackageJson = {
      name: "test-package",
      version: "1.0.0",
      dependencies: {
        "dep-package": "^1.0.0",
      },
      devDependencies: {
        "dev-package": "^2.0.0",
      },
      optionalDependencies: {
        "opt-package": "^3.0.0",
      },
      peerDependencies: {
        "peer-package": "^4.0.0",
      },
      peerDependenciesMeta: {
        "peer-package": {
          optional: true,
        },
      },
      peerDevDependencies: [],
    };
    const isAncestorDevDependency = false;

    const packageMeta = getPackageMeta(
      packagePath,
      packageJson,
      isAncestorDevDependency,
    );

    expect(packageMeta).toMatchObject({
      name: "test-package",
      version: "1.0.0",
      packagePath: "/path/to/package",
      dependencies: [
        {
          type: "dependencies",
          name: "dep-package",
          version: "^1.0.0",
          isPeerDevDependency: false,
          isPeerOptionalDependency: false,
        },
      ],
      devDependencies: [
        {
          type: "devDependencies",
          name: "dev-package",
          version: "^2.0.0",
          isPeerDevDependency: false,
          isPeerOptionalDependency: false,
        },
      ],
      optionalDependencies: [
        {
          type: "optionalDependencies",
          name: "opt-package",
          version: "^3.0.0",
          isPeerDevDependency: false,
          isPeerOptionalDependency: false,
        },
      ],
      peerDependencies: [
        {
          type: "peerDependencies",
          name: "peer-package",
          version: "^4.0.0",
          isPeerDevDependency: false,
          isPeerOptionalDependency: true,
        },
      ],
    });
  });
});

describe("gatherPeerDependencies", () => {
  it("should invoke walkPackageDependencyTree once", () => {
    gatherPeerDependencies("/test-package", DEFAULT_VALUE);
    expect(mocks.walkPackageDependencyTree).toBeCalledTimes(1);
  });
});

describe("isSameDep", () => {
  it("should return true if two dependencies are the same", () => {
    const dep1: Dependency = {
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
    };

    const dep2: Dependency = { ...dep1 };

    expect(isSameDep(dep1, dep2)).toBe(true);
  });

  it("should return false if two dependencies are not the same", () => {
    const dep1: Dependency = {
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
    };

    const dep2: Dependency = {
      ...dep1,
      name: "dep2",
    };

    expect(isSameDep(dep1, dep2)).toBe(false);
  });
});
