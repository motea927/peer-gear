import path from "node:path";
import fse from "fs-extra";
import { resolvePackageDir } from "./resolver";
import type { Dependency } from "./types";

export function getInstalledVersion(dep: Dependency): string | undefined {
  const peerDependencyDir = resolvePackageDir(".", dep.name);
  console.log("ggg", peerDependencyDir);
  if (!peerDependencyDir) {
    return undefined;
  }
  const { readJSONSync: readJson, existsSync } = fse;
  const packageJson = readJson(path.resolve(peerDependencyDir, "package.json"));
  const isYalc = existsSync(path.resolve(peerDependencyDir, "yalc.sig"));
  return isYalc ? `${packageJson.version}-yalc` : packageJson.version;
}
