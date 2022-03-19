import * as GetContextsFunctions from './get-contexts'
import {FetchedContext} from './get-contexts'
import * as GetContextEnvironmentVariablesFunctions from './get-context-environment-variables'
import {FetchedEnvVar} from './get-context-environment-variables'
import {APIRequest} from './request'

export * from './types'
export {createFetcher} from './v2-api'
export {GetContextsResponse, FetchedContext} from './get-contexts'
export * from './request'

export type GetContexts = (ownerId: string) => APIRequest<FetchedContext[]>
export type GetContextEnvironmentVariables = (contextId: string) => APIRequest<FetchedEnvVar[]>

export const getContexts: GetContexts =
  ownerId =>
    GetContextsFunctions.createRequest(ownerId).map(response => response.items)

export const getContextEnvironmentVariables: GetContextEnvironmentVariables =
  contextId =>
    GetContextEnvironmentVariablesFunctions.createRequest(contextId).map(response => response.items)

