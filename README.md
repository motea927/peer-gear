# ⚙️ peer-gear (WIP)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![Codecov][codecov-src]][codecov-href]

Forked from [check-peer-dependencies](https://github.com/christopherthielen/check-peer-dependencies)

Checks the peer dependencies of the current Node.js package and offers solutions for any unmet dependencies.

Note: Before proceeding, make sure to run `yarn install` to install all the necessary dependencies.

###### Changes in this fork

- The package is renamed to `peer-gear`, allowing you to use `npx peer-gear` directly.
- Removed npm options because `npm 7` and later versions will [automatically install peer dependencies](https://github.com/npm/rfcs/blob/main/implemented/0025-install-peer-deps.md).
- Refactored some code to make test writing easier.
- Added unit tests for more robustness.
- Added `--includePrerelease` option. Note that includePrerelease is disabled by default (WIP).

## Usage (WIP)

## Development

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Install dependencies using `yarn install`
- Run interactive tests using `yarn dev`

## License

Made with 💛

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/peer-gear?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/peer-gear
[npm-downloads-src]: https://img.shields.io/npm/dm/peer-gear?style=flat&colorA=18181B&colorB=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/peer-gear

[codecov-src]: https://img.shields.io/codecov/c/gh/motea927/peer-gear/main?style=flat&colorA=18181B&colorB=F0DB4F
[codecov-href]: https://codecov.io/gh/motea927/peer-gear

[bundle-src]: https://img.shields.io/bundlephobia/minzip/peer-gear?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-href]: https://bundlephobia.com/result?p=peer-gear
