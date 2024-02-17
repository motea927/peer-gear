import { describe, afterEach, it, expect, vi } from "vitest";
import type { Dependency } from "../packageUtils/types";
import { OrderBy } from "../constants";
import { reportPeerDependencyStatus, sortDependencies } from "./report";

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
  semverSatisfies: true,
  installedVersion: "1.0.0",
  isYalc: false,
  isIgnored: false,
};

const orderDeps: Dependency[] = [
  {
    name: "dep1",
    type: "dependencies",
    version: "^1.0.0",
    isPeerDevDependency: false,
    isPeerOptionalDependency: false,
    depender: {
      name: "test-package2",
      version: "1.0.0",
      packagePath: "/test-package2",
      dependencies: [],
      devDependencies: [],
      optionalDependencies: [],
      peerDependencies: [],
    },
  },
  {
    name: "dep2",
    type: "dependencies",
    version: "^2.0.0",
    isPeerDevDependency: false,
    isPeerOptionalDependency: false,
    depender: {
      name: "test-package1",
      version: "1.0.0",
      packagePath: "/test-package1",
      dependencies: [],
      devDependencies: [],
      optionalDependencies: [],
      peerDependencies: [],
    },
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("reportPeerDependencyStatus", () => {
  it("should report the status of a peer dependency", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    reportPeerDependencyStatus(defaultDependency, true, true, true);

    expect(spy).toHaveBeenCalledWith(
      "  ✅  test-package@1.0.0 requires dep1 ^1.0.0 (1.0.0 is installed)",
    );
  });

  it("should report the status of an unsatisfied peer dependency", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const dep: Dependency = {
      ...defaultDependency,
      semverSatisfies: false,
      installedVersion: "2.0.0",
    };

    reportPeerDependencyStatus(dep, true, true, true);

    expect(spy).toHaveBeenCalledWith(
      "  ❌  test-package@1.0.0 requires dep1 ^1.0.0 (2.0.0 is installed)",
    );
  });

  it("should report the status of a missing peer dependency", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const dep: Dependency = {
      ...defaultDependency,
      semverSatisfies: false,
      installedVersion: undefined,
    };

    reportPeerDependencyStatus(dep, true, true, true);

    expect(spy).toHaveBeenCalledWith(
      "  ❌  test-package@1.0.0 requires dep1 ^1.0.0 (dep1 is not installed)",
    );
  });
});

describe("sortDependencies", () => {
  it("should sort dependencies by depender", () => {
    const sortedDeps = sortDependencies(orderDeps, OrderBy.Depender);

    expect(sortedDeps).toEqual([orderDeps[1], orderDeps[0]]);
  });

  it("should sort dependencies by dependee", () => {
    const sortedDeps = sortDependencies(orderDeps, OrderBy.Dependee);

    expect(sortedDeps).toEqual([orderDeps[0], orderDeps[1]]);
  });
});
