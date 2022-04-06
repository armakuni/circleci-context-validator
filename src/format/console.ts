import * as chalk from 'chalk' // eslint-disable-line unicorn/import-style
import {ContextEnvVarMissingResult, ContextEnvVarUnexpectedResult, ContextMissingResult, ContextValidatedResult, ContextValidatorResult} from '../context-validator/types'
import {groupBy} from '../lib/util'

export const formatResult = (results: ContextValidatorResult[]): void => {
  let fail = 0
  for (const result of results) {
    if (result instanceof ContextMissingResult) {
      console.log(chalk.red(`Context "${result.contextName}" is missing`))
      fail++
    } else if (result instanceof ContextEnvVarUnexpectedResult) {
      console.log(chalk.red(`Unexpected Env Var "${result.envVarName}" in Context "${result.contextName}"`))
      fail++
    } else if (result instanceof ContextEnvVarMissingResult) {
      console.log(chalk.red(`Missing Env Var "${result.envVarName}" in Context "${result.contextName}"`))
      fail++
    } else if (result instanceof ContextValidatedResult) {
      console.log(chalk.green(`Context "${result.contextName}" is valid`))
    }
  }

  console.log(!fail ? chalk.green('Success') : chalk.red(`Failures ${fail}`))
}
