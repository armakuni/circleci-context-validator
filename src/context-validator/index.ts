import {createFetcher, getContexts} from '../circleci'
import {Config} from '../config/config'
import {Environment} from '../lib/environment'

export const validateContexts = async (config: Config, environment: Environment) => {
  const fetcher = createFetcher(environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)

  const fetchedContexts = await getContexts(config.owner.id)(fetcher)

  const expectedContextNames = config.contexts.map(context => context.name)
  const actualContextNames = new Set(fetchedContexts.map(context => context.name))
  const missingContexts = expectedContextNames.filter(name => !actualContextNames.has(name))

  return {
    missingContexts,
    fetchedContexts,
  }
}
