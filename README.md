CircleCI Context Validator CLI Tool
=================

[![CircleCI](https://circleci.com/gh/armakuni/circleci-context-validator/tree/main.svg?style=shield)](https://circleci.com/gh/armakuni/circleci-context-validator/tree/main)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g circleci-context-validator
$ ccv COMMAND
running command...
$ ccv (--version)
circleci-context-validator/0.0.0 darwin-x64 node-v14.17.0
$ ccv --help [COMMAND]
USAGE
  $ ccv COMMAND
...
```
<!-- usagestop -->

# Local Dev Usage
<!-- usage -->
```sh-session
CIRCLECI_PERSONAL_ACCESS_TOKEN=generate_personal_access_token bin/dev circleci validate --context-definitions example/context_validator.yml
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ccv help [COMMAND]`](#ccv-help-command)
* [`ccv plugins`](#ccv-plugins)
* [`ccv plugins:inspect PLUGIN...`](#ccv-pluginsinspect-plugin)
* [`ccv plugins:install PLUGIN...`](#ccv-pluginsinstall-plugin)
* [`ccv plugins:link PLUGIN`](#ccv-pluginslink-plugin)
* [`ccv plugins:uninstall PLUGIN...`](#ccv-pluginsuninstall-plugin)
* [`ccv plugins update`](#ccv-plugins-update)

## `ccv help [COMMAND]`

Display help for ccv.

```
USAGE
  $ ccv help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ccv.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

<!-- commandsstop -->
