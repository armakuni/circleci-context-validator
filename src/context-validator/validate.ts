import {
  ContextEnvVarMissingResult, ContextEnvVarUnexpectedResult,
  ContextMissingResult,
  ContextValidatedResult,
  ContextValidatorResult,
} from './result'
import {Config, ExpectedContext} from '../config/config'
import {FetchedContext} from '../circleci'

export default function validate(config: Config, fetchedContexts: FetchedContext[]): ContextValidatorResult[] {
  const fetchedContextNames = new Map(fetchedContexts.map(context => [context.name, context]))
  return config.contexts.flatMap(context =>
    fetchedContextNames.has(context.name) ?
      validateEnvVars(context.name, context, fetchedContextNames.get(context.name) as FetchedContext) :
      [new ContextMissingResult('context-one')],
  )
}

function validateEnvVars(contextName: string, contextConfig: ExpectedContext, fetchedContext: FetchedContext): ContextValidatorResult[] {
  const envVarNames = new Set(fetchedContext.environmentVariables)
  const expectedEnvVars = new Set(Object.keys(contextConfig['environment-variables']))

  const missingErrors = Object.entries(contextConfig['environment-variables'])
  .filter(([name])  => !envVarNames.has(name))
  .filter(([_, config])  => config.state === 'required')
  .map(([name]) => new ContextEnvVarMissingResult(contextName, name))

  const unexpectedErrors = fetchedContext.environmentVariables
  .filter(name => !expectedEnvVars.has(name))
  .map(name => new ContextEnvVarUnexpectedResult(contextName, name))

  const errors = [...missingErrors, ...unexpectedErrors]

  return errors.length > 0 ? errors : [new ContextValidatedResult(contextName)]
}
