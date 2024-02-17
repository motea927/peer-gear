import yargs from "yargs/yargs";
import { OrderBy, DEFAULT_VALUE } from "./constants";
import { checkPeerDependencies } from "./checkPeerDependencies";

import type { CliOptions } from "./types";

export function getCliArgv() {
  const argv = yargs(process.argv.slice(2))
    .usage(
      'Options may also be stored in package.json under the "checkPeerDependencies" key',
    )
    .option({
      help: {
        type: "boolean",
        alias: "h",
        description: `Print usage information`,
      },
    })
    .option({
      orderBy: {
        choices: [OrderBy.Dependee, OrderBy.Depender],
        default: DEFAULT_VALUE.orderBy,
        description: "Order the output by depender or dependee",
      },
    })
    .option({
      debug: {
        boolean: true,
        default: DEFAULT_VALUE.debug,
        description: "Print debugging information",
      },
    })
    .option({
      verbose: {
        boolean: true,
        default: DEFAULT_VALUE.verbose,
        description: "Prints every peer dependency, even those that are met",
      },
    })
    .option({
      ignore: {
        string: true,
        array: true,
        default: DEFAULT_VALUE.ignore,
        description: "package name to ignore (may specify multiple)",
      },
    })
    .option({
      runOnlyOnRootDependencies: {
        boolean: true,
        default: DEFAULT_VALUE.runOnlyOnRootDependencies,
        description: "Run tool only on package root dependencies",
      },
    })
    .option({
      findSolutions: {
        boolean: true,
        default: DEFAULT_VALUE.findSolutions,
        description:
          "Search for solutions and print package installation commands",
      },
    })
    .option({
      install: {
        boolean: true,
        default: DEFAULT_VALUE.install,
        description: "Install missing or incorrect peerDependencies",
      },
    })
    // .option({
    //   includePrerelease: { type: "boolean", default: false },
    // })

    .parseSync();
  return argv satisfies CliOptions;
}

export function main() {
  const argv = getCliArgv();
  if (argv.help) {
    process.exit(-2);
  }
  checkPeerDependencies(argv);
}
