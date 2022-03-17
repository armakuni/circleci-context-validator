import * as GetContextsFunctions from './get-contexts'
import {FetchedContext} from './get-contexts'
import * as GetContextEnvironmentVariablesFunctions from './get-context-environment-variables'
import {FetchedEnvVar} from './get-context-environment-variables'
import {APIRequest, mapRequest} from './request'

export * from './types'
export {createFetcher} from './v2-api'
export {GetContextsResponse, FetchedContext} from './get-contexts'
export * from './request'

export type GetContexts = (ownerId: string) => APIRequest<FetchedContext[]>
export type GetContextEnvironmentVariables = (ownerId: string) => APIRequest<FetchedEnvVar[]>

export const getContexts: GetContexts =
  ownerId =>
    mapRequest(response => response.items, GetContextsFunctions.createRequest(ownerId))

export const getContextEnvironmentVariables: GetContextEnvironmentVariables =
  contextId =>
    mapRequest(response => response.items, GetContextEnvironmentVariablesFunctions.createRequest(contextId))

