import {
  APIRequest,
  chainRequest,
  GetContextEnvironmentVariables,
  GetContexts,
  mapRequest,
  sequenceRequest,
} from '../circleci'
import {Config} from '../config/config'
import {ContextValidatorResult} from './types'
import {fetchAllContextsAndValidate, fetchContextAndValidate, missingContext} from './requests'

const combineResults: <T>(_: APIRequest<T[]>[]) => APIRequest<T[]> =
  <T>(results: APIRequest<T[]>[]) =>
    mapRequest((results: T[][]) => results.flat(), sequenceRequest(results))

export const validateContexts: (config: Config, getContexts: GetContexts, getContextEnvironmentVariables: GetContextEnvironmentVariables) => APIRequest<ContextValidatorResult[]> =
  (config, getContexts, getContextEnvironmentVariables) => {
    const createValidateContextRequest = fetchContextAndValidate(getContextEnvironmentVariables)
    const contextsRequest = getContexts(config.owner.id)

    const validateContexts = fetchAllContextsAndValidate(createValidateContextRequest, missingContext, config.contexts)
    const validateContextRequests = mapRequest(validateContexts, contextsRequest)
    return chainRequest(combineResults, validateContextRequests)
  }

// export const validateContexts: (_: Config) => APIRequest<ContextValidatorResult[]> =
//   config =>
//     doValidateContexts(config, CircleCI.getContexts, CircleCI.getContextEnvironmentVariables)
