import {APIRequest, ContextItem, getContextEnvironmentVariables, getContexts, sequenceRequest} from './index'

export interface FetchedContext {
  name: string
  environmentVariables: string[]
}

export const getContextsWithEnvironmentVariables: (ownerId: string, contexts: Set<string>) => APIRequest<FetchedContext[]> =
  (ownerId, contexts) =>
    getContexts(ownerId)
    .flatMap(fetchedContexts => fetchContextsDetails(contexts, fetchedContexts))

const fetchContextsDetails: (_: Set<string>, fetchedContexts: ContextItem[]) => APIRequest<FetchedContext[]> =
  (requestedContexts, fetchedContexts) => {
    const requests: APIRequest<FetchedContext>[] = fetchedContexts
    .filter(context => requestedContexts.has(context.name))
    .map(context => fetchContextDetails(context))

    return sequenceRequest(requests)
  }

const fetchContextDetails: (context: ContextItem) => APIRequest<FetchedContext> =
  context =>
    getContextEnvironmentVariables(context.id).map(response => ({
      name: context.name,
      environmentVariables: response.map(entry => entry.variable),
    }))
