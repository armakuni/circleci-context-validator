import {createFetcher, getContextEnvironmentVariables, getContexts} from '../circleci'
import {Config} from '../config/config'
import {Environment} from '../lib/environment'
import {ContextEnvVarMissingResult, ContextMissingResult, ContextValidatedResult, ContextValidatorResult} from './types'

/* TODO: parallelize API calls and env var validation logic */
export const validateContexts = async (config: Config, environment: Environment): Promise<ContextValidatorResult[]> => {
  const fetcher = createFetcher(environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)

  const fetchedContexts = await getContexts(config.owner.id)(fetcher)

  const actualContextNames = new Map(fetchedContexts.map(context => [context.name, context.id]))

  const results: ContextValidatorResult[] = []
  for (const context of config.contexts) {
    if (actualContextNames.has(context.name)) {
      const expectedEnvVars = Object.keys(context['environment-variables'])
      /* eslint-disable no-await-in-loop */
      const envVars = await getContextEnvironmentVariables(actualContextNames.get(context.name) as string)(fetcher)
      const envVarSet = new Set(envVars.map(env => env.variable))

      for (const envVarName of expectedEnvVars) {
        if (!envVarSet.has(envVarName)) {
          results.push(new ContextEnvVarMissingResult(context.name, envVarName))
        }
      }

      if (results.length === 0) {
        results.push(new ContextValidatedResult(context.name))
      }
    } else {
      results.push(new ContextMissingResult(context.name))
    }
  }

  return results
}
