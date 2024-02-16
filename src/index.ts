import yargs from "yargs/yargs";
import { OrderBy } from "./constants";
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
        default: OrderBy.Dependee,
        description: "Order the output by depender or dependee",
      },
    })
    .option({
      debug: {
        boolean: true,
        default: false,
        description: "Print debugging information",
      },
    })
    .option({
      verbose: {
        boolean: true,
        default: false,
        description: "Prints every peer dependency, even those that are met",
      },
    })
    .option({
      ignore: {
        string: true,
        array: true,
        default: [],
        description: "package name to ignore (may specify multiple)",
      },
    })
    .option({
      runOnlyOnRootDependencies: {
        boolean: true,
        default: false,
        description: "Run tool only on package root dependencies",
      },
    })
    .option({
      findSolutions: {
        boolean: true,
        default: false,
        description:
          "Search for solutions and print package installation commands",
      },
    })
    .option({
      install: {
        boolean: true,
        default: false,
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
}

main();
