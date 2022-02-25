import {ContextItem, getContexts} from './get-contexts'
import {APIFetcher} from './v2-api'
import {EnvironmentVariable, getContextEnvironmentVariables} from './get-context-environment-variables'

export * from './types'
export * from './v2-api'
export {GetContextsResponse, ContextItem} from './get-contexts'

export async function fetchContexts(ownerId: string, fetcher: APIFetcher): Promise<ContextItem[]> {
  return (await getContexts(ownerId)(fetcher)).items
}

export async function fetchContextEnvironmentVariables(contextId: string, fetcher: APIFetcher): Promise<EnvironmentVariable[]> {
  return (await getContextEnvironmentVariables(contextId)(fetcher)).items
}
