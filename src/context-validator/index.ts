import {APIRequest, GetContextEnvironmentVariables, GetContexts} from '../circleci'
import {Config} from '../config/config'
import {ContextValidatorResult} from './types'
import {createValidateContextRequest, missingContextRequest, validateContextsRequest} from './requests'
import * as Contexts from './contexts'
import {combineResults} from './request-helpers'

export function validateContexts(
  config: Config,
  getContexts: GetContexts,
  getContextEnvironmentVariables: GetContextEnvironmentVariables,
): APIRequest<ContextValidatorResult[]> {
  const fetchContexts = getContexts(config.owner.id)
  const validateContextRequest = createValidateContextRequest(getContextEnvironmentVariables)
  const identifyContexts = Contexts.multiIdentifier(config.contexts)
  const validateAllContexts = validateContextsRequest(validateContextRequest, missingContextRequest)

  return fetchContexts
  .map(fetchedContexts => validateAllContexts(identifyContexts(Contexts.singleIdentifier(Contexts.ids(fetchedContexts)))))
  .flatMap(requests => combineResults(requests))
}
