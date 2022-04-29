import {ContextItem} from './get-contexts'
import * as GetContexts from './get-contexts'
import * as GetContextEnvironmentVariables from './get-context-environment-variables'
import {EnvironmentVariable} from './get-context-environment-variables'
import {paginatedRequest} from './pagination'
import {APIRequest} from './api-request'

export * from './types'
export * from './v2-api'
export * from './api-fetcher'
export * from './api-request'
export {GetContextsResponse, ContextItem} from './get-contexts'

export const getContexts = (ownerId: string): APIRequest<ContextItem[]> =>
  paginatedRequest(GetContexts.createRequest(ownerId))

export const getContextEnvironmentVariables = (contextId: string): APIRequest<EnvironmentVariable[]> =>
  paginatedRequest(GetContextEnvironmentVariables.createRequest(contextId))
export {APIFetcher} from './api-fetcher'
