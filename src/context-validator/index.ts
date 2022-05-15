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

interface FetchedContext {
  name: string
  'environment-variables': string[]
}

export const validateContexts: (_: Config) => APIRequest<[ContextValidatorResult[], FetchedContext[]]> =
  config =>
    getContexts(config.owner.id)
    .flatMap(fetchedContexts =>
      validateContextResponse(config, fetchedContexts)
      .flatMap(results => fetchContextsDetails(config, fetchedContexts).map(x => [results, x])),
    )

const fetchContextsDetails: (_: Config, fetchedContexts: ContextItem[]) => APIRequest<FetchedContext[]> =
  (config, fetchedContexts) => {
    const requestedContexts = new Set(config.contexts.map(context => context.name))

    const requests: APIRequest<FetchedContext>[] = fetchedContexts
    .filter(context => requestedContexts.has(context.name))
    .map(context => fetchContextDetails(context))

    return sequenceRequest(requests)
  }

const fetchContextDetails: (context: ContextItem) => APIRequest<FetchedContext> =
  context =>
    getContextEnvironmentVariables(context.id).map(response => ({
      name: context.name,
      'environment-variables': response.map(entry => entry.variable),
    }))

const validateContextResponse: (_: Config, fetchedContexts: ContextItem[]) => APIRequest<ContextValidatorResult[]> =
  (config, fetchedContexts) => {
    const actualContextNames = new Map(fetchedContexts.map(context => [context.name, context.id]))

    const requests: APIRequest<ContextValidatorResult[]>[] =
      config.contexts.map(context =>
        actualContextNames.has(context.name) ?
          processEnvVarsForContext(context, actualContextNames) :
          missingContextFetcher(context.name),
      )

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
const processEnvVarsForContext: (_: Context, actualContextNames: Map<string, string>) => APIRequest<ContextValidatorResult[]> =
  (context, actualContextNames) =>
    getContextEnvironmentVariables(actualContextNames.get(context.name) as string)
    .map(apiEnvVars => processApiValidation(context, apiEnvVars))

/*
 * A Context is only considered a valid result if all expected configured env vars are present and no extra from the api
 */
const processApiValidation: (_: Context, apiEnvVars: EnvironmentVariable[]) => ContextValidatorResult[] =
  (context, apiEnvVars) => {
    const configEnvVars = Object.keys(context['environment-variables'])
    const apiEnvVarSet = new Set(apiEnvVars.map(env => env.variable))

    const missingEnvVars = configEnvVars
    .filter(envVarName => context['environment-variables'][envVarName].state !== 'optional' && !apiEnvVarSet.has(envVarName))
    .map(envVarName => new ContextEnvVarMissingResult(context.name, envVarName))

    const unexpectedEnvVars = [...apiEnvVarSet]
    .filter(envVarName => !configEnvVars.includes(envVarName))
    .map(envVarName => new ContextEnvVarUnexpectedResult(context.name, envVarName))

    const results = [...missingEnvVars, ...unexpectedEnvVars]

    return results.length > 0 ? results : [new ContextValidatedResult(context.name)]
  }
