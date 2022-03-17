import {
  APIRequest,
  GetContextEnvironmentVariables,
  GetContexts,
  sequenceRequest,
} from '../circleci'
import {Config} from '../config/config'
import {ContextValidatorResult} from './types'
import {fetchAllContextsAndValidate, fetchContextAndValidate, missingContext} from './requests'

const combineResults: <T>(_: APIRequest<T[]>[]) => APIRequest<T[]> =
  <T>(results: APIRequest<T[]>[]) =>
    sequenceRequest(results).map((results: T[][]) => results.flat())

export const validateContexts: (config: Config, getContexts: GetContexts, getContextEnvironmentVariables: GetContextEnvironmentVariables) => APIRequest<ContextValidatorResult[]> =
  (config, getContexts, getContextEnvironmentVariables) => {
    const createValidateContextRequest = fetchContextAndValidate(getContextEnvironmentVariables)
    const contextsRequest = getContexts(config.owner.id)

    const validateContexts = fetchAllContextsAndValidate(createValidateContextRequest, missingContext, config.contexts)
    const validateContextRequests = contextsRequest.map(fetchedContexts => validateContexts(fetchedContexts))
    return validateContextRequests.flatMap(requests => combineResults(requests))
  }
