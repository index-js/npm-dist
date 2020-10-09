# npm-dist
> Trim node_modules, copy to dist/node_modules, smaller and faster than before, for server side

## Installation

Install via `npm`:

```
$ npm i npm-dist
```

## Rules

1. Delete package.json, pkg.main is no longer needed
2. Save only reference files
3. When there is only one file, move the package to the root directory

![Beofre Directory](./src/before.png) ![After Directory](./src/after.png)

## Usage

``` js
const trim = require('npm-dist')
// Installed express
trim('express')
```

## Authors

**Yanglin** ([i@yangl.in](mailto:mail@yanglin.me))


## License

Copyright (c) 2020 Yanglin

Released under the MIT license
