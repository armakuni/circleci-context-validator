import {ContextItem, getContexts} from './get-contexts'
import {createFetcher} from './v2-api'

export * from './types'
export {GetContextsResponse, ContextItem} from './get-contexts'

export async function fetchContexts(ownerId: string, personalAccessToken: string): Promise<ContextItem[]> {
  const fetcher = createFetcher(personalAccessToken)
  return (await getContexts(ownerId)(fetcher)).items
}
