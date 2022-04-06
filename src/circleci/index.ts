import {ContextItem} from './get-contexts'
import {APIRequest} from './v2-api'
import * as GetContexts from './get-contexts'
import * as GetContextEnvironmentVariables from './get-context-environment-variables'
import {EnvironmentVariable} from './get-context-environment-variables'

export * from './types'
export * from './v2-api'
export {GetContextsResponse, ContextItem} from './get-contexts'

export const getContexts = (ownerId: string): APIRequest<ContextItem[]> =>
  GetContexts.createRequest(ownerId).map(response => response.items)

export const getContextEnvironmentVariables = (contextId: string): APIRequest<EnvironmentVariable[]> =>
  GetContextEnvironmentVariables.createRequest(contextId).map(response => response.items)
