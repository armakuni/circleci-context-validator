import {ContextItem, getContexts} from './get-contexts'
import {APIRequest, mapRequest} from './v2-api'
import {EnvironmentVariable, getContextEnvironmentVariables} from './get-context-environment-variables'

export * from './types'
export * from './v2-api'
export {GetContextsResponse, ContextItem} from './get-contexts'

export const fetchContexts = (ownerId: string): APIRequest<ContextItem[]> =>
  mapRequest(response => response.items, getContexts(ownerId))

export const fetchContextEnvironmentVariables = (contextId: string): APIRequest<EnvironmentVariable[]> =>
  mapRequest(response => response.items, getContextEnvironmentVariables(contextId))
