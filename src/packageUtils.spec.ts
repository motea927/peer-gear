import { describe, it, vi, expect } from "vitest";
import { resolvePackageDirWith } from "./packageUtils";

describe("resolvePackageDir", () => {
  it("should return package dir", () => {
    const basedir = "/path/to/basedir";
    const packageName = "test-package";
    let packagePath: string | undefined;

    const mockResolveSync = vi.fn((_packageName, options) => {
      const packageFilter = options.packageFilter;
      const pkg = {};
      const pkgdir = "expectedPackagePath";
      packageFilter(pkg, pkgdir);
      packagePath = pkgdir;
    });

    const result = resolvePackageDirWith(mockResolveSync, basedir, packageName);

    expect(mockResolveSync).toHaveBeenCalledWith(
      packageName,
      expect.objectContaining({
        basedir,
        packageFilter: expect.any(Function),
      }),
    );
    expect(result).toBe(packagePath);
  });

  it("should return undefined if package not found", () => {
    const basedir = "/path/to/basedir";
    const packageName = "non-existent-package";

    const mockResolveSync = vi.fn();

    const packageDir = resolvePackageDirWith(
      mockResolveSync,
      basedir,
      packageName,
    );

    expect(packageDir).toBeUndefined();
  });
});
