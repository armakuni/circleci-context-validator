import {ExpectedContext} from '../config/config'
import {FetchedEnvVar} from '../circleci/get-context-environment-variables'
import {ContextMissingResult, ContextValidatorResult, IdentifiedContext} from './types'
import * as EnvVars from './environment-variables'
import {APIRequest, constantResponseRequest, GetContextEnvironmentVariables} from '../circleci'
import {createRequestsWithDefault} from './request-helpers'
import * as Contexts from './contexts'

type CreateMissingContextRequest = (_: ExpectedContext) => APIRequest<ContextValidatorResult[]>

type CreateValidateContextRequest = (_: IdentifiedContext) => APIRequest<ContextValidatorResult[]>

const validateAllContextEnvVars: (_: ExpectedContext) => (_: FetchedEnvVar[]) => ContextValidatorResult[] =
  context =>
    EnvVars.validateAll(context)(EnvVars.analyseAll(context), EnvVars.validateSingle(context))

export const missingContextRequest: CreateMissingContextRequest =
  context =>
    constantResponseRequest([new ContextMissingResult(context.name)])

export const createValidateContextRequest : (_: GetContextEnvironmentVariables) => CreateValidateContextRequest =
  getContextEnvironmentVariables => context =>
    getContextEnvironmentVariables(context.id).map(validateAllContextEnvVars(context))

export const validateContextsRequest:
  (validate: CreateValidateContextRequest, missing: CreateMissingContextRequest)
    => (_: (ExpectedContext | IdentifiedContext)[])
    => APIRequest<ContextValidatorResult[]>[] =
  (createFetchContextAndValidateRequest, createMissingContextRequest) => contexts =>
    createRequestsWithDefault(
      Contexts.isIdentified,
      context => createFetchContextAndValidateRequest(context as IdentifiedContext),
      createMissingContextRequest,
      contexts,
    )

