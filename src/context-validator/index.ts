import {
  APIRequest,
  constantResponseRequest,
  ContextItem,
  getContextEnvironmentVariables,
  getContexts,
  sequenceRequest,
} from '../circleci'
import {EnvironmentVariable} from '../circleci/get-context-environment-variables'
import {Config, Context} from '../config/config'
import {
  ContextEnvVarMissingResult,
  ContextEnvVarUnexpectedResult,
  ContextMissingResult,
  ContextValidatedResult,
  ContextValidatorResult,
} from './types'

export const validateContexts = (config: Config): APIRequest<ContextValidatorResult[]> =>
  getContexts(config.owner.id)
  .flatMap(fetchedContexts => validateContextResponse(config, fetchedContexts))

const validateContextResponse = (config: Config, fetchedContexts: ContextItem[]): APIRequest<ContextValidatorResult[]> => {
  const actualContextNames = new Map(fetchedContexts.map(context => [context.name, context.id]))

  const requests: APIRequest<ContextValidatorResult[]>[] = config.contexts.map(context =>
    actualContextNames.has(context.name) ?
      processEnvVarsForContext(context, actualContextNames)      :
      missingContextFetcher(context.name))

  return sequenceRequest(requests).map((responses: ContextValidatorResult[][]) => responses.flat())
}

const missingContextFetcher = (contextName: string): APIRequest<ContextValidatorResult[]> =>
  constantResponseRequest([new ContextMissingResult(contextName)])

/*
 * Process a context's env vars provided in the context definition config
 * Retrieve a context's env vars from the CircleCI API using a context ID
 * Create a set of all the key names to be used as a lookup against the env vars from the config
 * Determine if the configured env var is optional/required against what is returned against the API
 * Determine if there are additional unexpected env vars returned from the API that are not configured
 */
const processEnvVarsForContext = (context: Context, actualContextNames: Map<string, string>): APIRequest<ContextValidatorResult[]> =>
  getContextEnvironmentVariables(actualContextNames.get(context.name) as string)
  .map(apiEnvVars => processApiValidation(context, apiEnvVars))

/*
 * A Context is only considered a valid result if all expected configured env vars are present and no extra from the api
 */
const processApiValidation = (context: Context, apiEnvVars: EnvironmentVariable[]): ContextValidatorResult[] => {
  const configEnvVars = Object.keys(context['environment-variables'])
  const apiEnvVarSet = new Set(apiEnvVars.map(env => env.variable))

  const results: ContextValidatorResult[] = []
  for (const envVarName of configEnvVars) {
    if (context['environment-variables'][envVarName].state !== 'optional' && !apiEnvVarSet.has(envVarName)) {
      results.push(new ContextEnvVarMissingResult(context.name, envVarName))
    }
  }

  for (const envVarName of apiEnvVarSet) {
    if (!configEnvVars.includes(envVarName)) {
      results.push(new ContextEnvVarUnexpectedResult(context.name, envVarName))
    }
  }

  if (results.length === 0) {
    results.push(new ContextValidatedResult(context.name))
  }

  return results
}
