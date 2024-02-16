import { describe, it, expect } from "vitest";
import { buildDependencyArray } from "./dependencies";

import type { PackageJson, PackageMeta } from "./types";

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

    expect(result).toEqual([
      {
        name: "dep1",
        type: "dependencies",
        version: "1.0.0",
        isPeerDevDependency: false,
        isPeerOptionalDependency: true,
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
