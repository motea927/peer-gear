export function packageFilter() {
  let packagePath: string | undefined;

  return {
    getPackagePath: () => packagePath,
    filter: (pkg: Record<string, any>, pkgdir: string) => {
      console.log("call filter", pkg);

      if (!packagePath || pkg.version) {
        packagePath = pkgdir;
      }
      return pkg;
    },
  };
}
