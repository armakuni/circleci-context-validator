import * as chalk from 'chalk' // eslint-disable-line unicorn/import-style
import {ContextEnvVarMissingResult, ContextEnvVarUnexpectedResult, ContextMissingResult, ContextValidatedResult, ContextValidatorResult} from '../context-validator/types'

export const formatResult = (results: ContextValidatorResult[]): number => {
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

  console.log(fail ? chalk.red(`Failures ${fail}`) : chalk.green('Success'))
  return fail ? 1 : 0
}
