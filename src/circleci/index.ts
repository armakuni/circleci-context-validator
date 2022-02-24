import {ContextItem, getContexts} from './get-contexts'

export * from './types'
export {GetContextsResponse, ContextItem} from './get-contexts'

export async function fetchContexts(ownerId: string, personalAccessToken: string): Promise<ContextItem[]> {
  return (await getContexts(ownerId)(personalAccessToken)).items
}
