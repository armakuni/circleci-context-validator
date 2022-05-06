CircleCI Context Validator CLI Tool
=================

[![CircleCI](https://circleci.com/gh/armakuni/circleci-context-validator/tree/main.svg?style=svg&circle-token=e243ff035113b5a9b5d5b939673556e063ac3b5a)](https://circleci.com/gh/armakuni/circleci-context-validator/tree/main)

<!-- toc -->
* [Purpose](#purpose)
* [Prerequisites](#prerequisites)
* [Install](#install)
* [Commands](#commands)
* [Example](#examples)
* [Dev Mode](#development)
* [WIP](#wip)
<!-- tocstop -->

# Purpose 
As projects grow, team members drop in and out and the documented state of environment variables become a mystery, and left in a precarious state not knowing if a varaible is required any more looking at the Circle UI.

CircleCI Context Validator (*CCV for short*) makes use of a simple yaml configuration file, [refer to the example](./example/context_validator.yml). The configuration file refers to the names of the context and associated environment variables. The config should reflect what should only be present in your context (can be more than one, should you need that), is then compared against the API giving back user input on valid or failures.

# Prerequisites
- [CircleCI using Contexts](https://circleci.com/docs/2.0/contexts/)
- A CircleCI Organization ID
    - NOTE: Retrieve ID at the following https://app.circleci.com/settings/organization/github/YOUR_ORG_NAME_HERE/overview
- [CircleCI Personal API Token](https://app.circleci.com/settings/user/tokens) 
    - NOTE: [Managing API Tokens](https://circleci.com/docs/2.0/managing-api-tokens/)

# Install
```sh-session
$ npm install -g circleci-context-validator
``` 
or 
```sh-session
$ yarn global add circleci-context-validator
```

# Commands
```
$ ccv (--version)
circleci-context-validator/0.0.0 darwin-x64 node-v14.17.0
$ ccv --help [COMMAND]
USAGE
  $ CIRCLECI_PERSONAL_ACCESS_TOKEN=example-token ccv circleci validate --context-definitions example/context_validator.yml
```

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

# Examples
Run the CLI tool:
```sh
CIRCLECI_PERSONAL_ACCESS_TOKEN=example-token ccv circleci validate --context-definitions .circleci/context_validator.yml
```

## All Valid 
Context exists, associated env var values configured exist in context definition yaml.
```
Context "context-validator-ci" is valid
Success
```

## Missing Env Var
Configured in context definition yaml, but not present in CircleCI Context
```
Missing Env Var "API_KEY" in Context "context-validator-ci"
Failures 1
```

## Missing Context
Configured in context definition yaml, but not present in CircleCI Context
```
Context "context-validator-cid" is missing
Failures 1
```
## Undocumented
A value is not configured, but exists in circleci
```
Unexpected Env Var "NPM_TOKEN" in Context "context-validator-ci"
Failures 1
```

# Development
## Entrypoint
Command entrypoint is located: `circleci-context-validator/src/commands/circleci/validate`
## NVM
```
$ cd circleci-context-validator
$ nvm use .
```

## Dev Run (no compile)
```sh-session
CIRCLECI_PERSONAL_ACCESS_TOKEN=generate_personal_access_token bin/dev circleci validate --context-definitions example/context_validator.yml
```

# WIP
- Pretty console output
- Different output formats e.g. JSON
- Support for standard Environment Variables i.e. non-context associated
