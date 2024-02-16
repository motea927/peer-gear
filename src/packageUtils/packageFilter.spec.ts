import { describe, it, expect } from "vitest";
import { packageFilter } from "./packageFilter";

describe("packageFilter", () => {
  it("Initially, packagePath should be undefined", () => {
    const { getPackagePath } = packageFilter();

    expect(getPackagePath()).toBeUndefined();
  });

  it("After calling the filter function, packagePath should be set to pkgdir", () => {
    const { getPackagePath, filter } = packageFilter();

    const pkg = { version: "1.0.0" };
    const pkgdir = "/path/to/package";

    filter(pkg, pkgdir);
    expect(getPackagePath()).toBe(pkgdir);
  });

  it("If the package has no version, should return pkgdir", () => {
    const { getPackagePath, filter } = packageFilter();
    const pkgNoVersion = {};
    const pkgdir2 = "/path/to/another/package2";
    filter(pkgNoVersion, pkgdir2);
    expect(getPackagePath()).toBe(pkgdir2);
  });
});
