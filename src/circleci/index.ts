import {ContextItem} from './get-contexts'
import {APIRequest} from './v2-api'
import * as GetContexts from './get-contexts'
import * as GetContextEnvironmentVariables from './get-context-environment-variables'
import {EnvironmentVariable} from './get-context-environment-variables'
import {paginatedRequest} from './pagination'

export * from './types'
export * from './v2-api'
export {GetContextsResponse, ContextItem} from './get-contexts'

export const getContexts = (ownerId: string): APIRequest<ContextItem[]> =>
  paginatedRequest(GetContexts.createRequest(ownerId))

export const getContextEnvironmentVariables = (contextId: string): APIRequest<EnvironmentVariable[]> =>
  paginatedRequest(GetContextEnvironmentVariables.createRequest(contextId))
