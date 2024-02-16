export function packageFilter() {
  let packagePath: string | undefined;

  return {
    getPackagePath: () => packagePath,
    filter: (pkg: Record<string, any>, pkgdir: string) => {
      if (!packagePath || pkg.version) {
        packagePath = pkgdir;
      }
      return pkg;
    },
  };
}
