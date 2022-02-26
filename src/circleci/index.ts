import {ContextItem, createRequest} from './get-contexts'
import {APIRequest, mapRequest} from './v2-api'
import * as GetContextEnvironmentVariables from './get-context-environment-variables'
import {EnvironmentVariable} from './get-context-environment-variables'

export * from './types'
export * from './v2-api'
export {GetContextsResponse, ContextItem} from './get-contexts'

export const getContexts = (ownerId: string): APIRequest<ContextItem[]> =>
  mapRequest(response => response.items, createRequest(ownerId))

export const getContextEnvironmentVariables = (contextId: string): APIRequest<EnvironmentVariable[]> =>
  mapRequest(response => response.items, GetContextEnvironmentVariables.createRequest(contextId))
