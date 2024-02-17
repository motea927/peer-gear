/* v8 ignore next 999 */

function runCommand(...args) {
  process.argv = ["npx", "peer-gear", ...args];

  return import("../src/cli");
}

// Run the CLI with the any flag
runCommand(["--findSolutions"]);
