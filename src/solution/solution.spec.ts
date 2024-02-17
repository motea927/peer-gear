import { describe, it, expect, vi } from "vitest";
import type { Dependency } from "../packageUtils";
import {
  getUniqueProblems,
  determineResolutionType,
  semverReverseSort,
  findPossibleResolution,
  formatResolution,
} from "./solution";

const mocks = vi.hoisted(() => {
  return {
    execSync: vi.fn(),
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
};

vi.mock("node:child_process", () => {
  return {
    execSync: mocks.execSync,
  };
});

describe("getUniqueProblems", () => {
  it("should return unique problems", () => {
    const problems: Dependency[] = [
      defaultDependency,
      defaultDependency,
      {
        name: "dep2",
        type: "dependencies",
        version: "^2.0.0",
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
      },
    ];

    const result = getUniqueProblems(problems);

    // unique problems are dep1 and dep2
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(problems[0]);
    expect(result).toContainEqual(problems[2]);
  });
});

describe("determineResolutionType", () => {
  it('should return "upgrade" if installedVersion is present', () => {
    const problem: Dependency = {
      name: "dep1",
      type: "dependencies",
      version: "^1.0.0",
      installedVersion: "1.0.0",
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

    expect(determineResolutionType(problem)).toBe("upgrade");
  });

  it('should return "devInstall" if isPeerDevDependency is true', () => {
    const problem: Dependency = {
      name: "dep1",
      type: "dependencies",
      version: "^1.0.0",
      isPeerDevDependency: true,
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

    expect(determineResolutionType(problem)).toBe("devInstall");
  });

  it('should return "install" if neither installedVersion is present nor isPeerDevDependency is true', () => {
    const problem: Dependency = {
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

    expect(determineResolutionType(problem)).toBe("install");
  });
});

describe("semverReverseSort", () => {
  it("should sort semver versions in reverse order", () => {
    const versions = ["1.0.0", "2.0.0", "1.2.0", "2.1.0", "1.1.0"];
    const sortedVersions = versions.sort(semverReverseSort);

    expect(sortedVersions).toEqual([
      "2.1.0",
      "2.0.0",
      "1.2.0",
      "1.1.0",
      "1.0.0",
    ]);
  });
});

describe("findPossibleResolution", () => {
  it("should find a possible resolution for a package", () => {
    const packageName = "dep1";
    const allPeerDeps: Dependency[] = [defaultDependency];

    vi.mocked(mocks.execSync).mockReturnValueOnce(
      JSON.stringify(["2.0.1", "1.0.0", "3.0.0", "1.5.2"]),
    );

    const resolution = findPossibleResolution(packageName, allPeerDeps);

    expect(resolution).toBe("1.5.2");
  });
});

describe("formatResolution", () => {
  it("should format the resolution correctly", () => {
    const problem = defaultDependency;

    const resolutionVersion = "1.0.0";

    const formattedResolution = formatResolution(problem, resolutionVersion);

    expect(formattedResolution).toBe(`${problem.name}@${resolutionVersion}`);
  });

  it("should return an empty string if resolutionVersion is not provided", () => {
    const problem = defaultDependency;

    const formattedResolution = formatResolution(problem, "");

    expect(formattedResolution).toBe("");
  });
});
