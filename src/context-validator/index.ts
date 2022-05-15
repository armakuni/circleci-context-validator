import {APIRequest, ContextItem, getContextEnvironmentVariables, getContexts, sequenceRequest} from '../circleci'
import {Config} from '../config/config'
import {ContextValidatorResult, FetchedContext} from './types'
import validate from './validate'

export const validateContexts: (_: Config) => APIRequest<[ContextValidatorResult[], FetchedContext[]]> =
  config =>
    getContexts(config.owner.id)
    .flatMap(fetchedContexts => fetchContextsDetails(config, fetchedContexts).map(contexts => [validate(config, contexts), contexts]))

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
