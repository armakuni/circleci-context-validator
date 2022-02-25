import {ContextItem, getContexts} from './get-contexts'
import {createFetcher} from './v2-api'
import {EnvironmentVariable, getContextEnvironmentVariables} from './get-context-environment-variables'

export * from './types'
export {GetContextsResponse, ContextItem} from './get-contexts'

export async function fetchContexts(ownerId: string, personalAccessToken: string): Promise<ContextItem[]> {
  const fetcher = createFetcher(personalAccessToken)
  return (await getContexts(ownerId)(fetcher)).items
}

export async function fetchContextEnvironmentVariables(contextId: string, personalAccessToken: string): Promise<EnvironmentVariable[]> {
  const fetcher = createFetcher(personalAccessToken)
  return (await getContextEnvironmentVariables(contextId)(fetcher)).items
}
