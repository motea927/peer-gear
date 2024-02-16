import resolve from "resolve";
import { packageFilter } from "./packageFilter";

export function resolvePackageDir(basedir: string, packageName: string) {
  const { getPackagePath, filter } = packageFilter();
  try {
    resolve.sync(packageName, { basedir, packageFilter: filter });
  } catch {
    // resolve.sync throws if no main: is present
    // Some packages (such as @types/*) do not have a main
    // As long as we have a packagePath, it's fine
  }

  return getPackagePath();
}
