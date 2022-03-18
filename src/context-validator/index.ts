import {APIFetcher, APIRequest, getContextEnvironmentVariables, getContexts} from '../circleci'
import {Config, Context} from '../config/config'
import {ContextEnvVarMissingResult, ContextMissingResult, ContextValidatedResult, ContextValidatorResult} from './types'

export const validateContexts = (config: Config): APIRequest<ContextValidatorResult[]> => {
  return async (fetcher: APIFetcher) => {
    const fetchedContexts = await getContexts(config.owner.id)(fetcher)
    const actualContextNames = new Map(fetchedContexts.map(context => [context.name, context.id]))

    const results: APIRequest<ContextValidatorResult[]>[] = []
    for (const context of config.contexts) {
      if (actualContextNames.has(context.name)) {
        results.push(processEnvVarsForContext(context, actualContextNames))
      } else {
        results.push(missingContextFetcher(context.name))
      }
    }

    const promises = results.map(result => result(fetcher))
    const promiseResults = await Promise.all(promises)

    return promiseResults.flat()
  }
}

const missingContextFetcher = (contextName: string): APIRequest<ContextValidatorResult[]> => {
  return async (_fetcher: APIFetcher) => {
    return [new ContextMissingResult(contextName)]
  }
}

/*
 * Process a context's env vars provided in the context definition config
 * Retrieve a context's env vars from the CircleCI API using a context ID
 * Create a set of all the key names to be used as a lookup against the env vars from the config
 */
const processEnvVarsForContext = (context: Context, actualContextNames: Map<string, string>): APIRequest<ContextValidatorResult[]> => {
  return async (fetcher: APIFetcher) => {
    const configEnvVars = Object.keys(context['environment-variables'])

    const apiEnvVars = await getContextEnvironmentVariables(actualContextNames.get(context.name) as string)(fetcher)
    const apiEnvVarSet = new Set(apiEnvVars.map(env => env.variable))

    const results: ContextValidatorResult[] = []
    for (const envVarName of configEnvVars) {
      if (context['environment-variables'][envVarName].state !== 'optional' && !apiEnvVarSet.has(envVarName)) {
        results.push(new ContextEnvVarMissingResult(context.name, envVarName))
      }
    }

    if (results.length === 0) {
      results.push(new ContextValidatedResult(context.name))
    }

    return results
  }
}
