import {createFetcher, getContexts} from '../circleci'
import {Config} from '../config/config'
import {Environment} from '../lib/environment'
import {ContextMissingResult, ContextValidatedResult, ContextValidatorResult} from './types'

export const validateContexts = async (config: Config, environment: Environment): Promise<ContextValidatorResult[]> => {
  const fetcher = createFetcher(environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)

  const fetchedContexts = await getContexts(config.owner.id)(fetcher)

  const expectedContextNames = config.contexts.map(context => context.name)
  const actualContextNames = new Set(fetchedContexts.map(context => context.name))

  const results: ContextValidatorResult[] = []
  for (const contextName of expectedContextNames) {
    if (actualContextNames.has(contextName)) {
      results.push(new ContextValidatedResult(contextName))
    } else {
      results.push(new ContextMissingResult(contextName))
    }
  }

  return results
}
