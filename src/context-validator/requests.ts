import {ExpectedContext, ExpectedEnvVarBlock} from '../config/config'
import {FetchedEnvVar} from '../circleci/get-context-environment-variables'
import {
  ContextFailedToValidateResult,
  ContextMissingResult,
  ContextSuccessfullyValidatedResult,
  ContextValidatorResult,
  EnvVarValidationError,
  IdentifiedContext,
} from './types'
import * as EnvVars from './environment-variables'
import {APIRequest, constantResponseRequest, GetContextEnvironmentVariables} from '../circleci'
import {createRequestsWithDefault} from './request-helpers'
import * as Contexts from './contexts'

type CreateMissingContextRequest = (_: ExpectedContext) => APIRequest<ContextValidatorResult[]>

type CreateValidateContextRequest = (_: IdentifiedContext) => APIRequest<ContextValidatorResult[]>

const validateAllContextEnvVars: (_: ExpectedEnvVarBlock) => (_: FetchedEnvVar[]) => EnvVarValidationError[] =
  expectedEnvVars =>
    EnvVars.validateAll(EnvVars.analyseAll(expectedEnvVars), EnvVars.validateSingle)

export const missingContextRequest: CreateMissingContextRequest =
  context =>
    constantResponseRequest([new ContextMissingResult(context.name)])

export const createValidateContextRequest : (_: GetContextEnvironmentVariables) => CreateValidateContextRequest =
  getContextEnvironmentVariables => context =>
    getContextEnvironmentVariables(context.id)
    .map(validateAllContextEnvVars(context['environment-variables']))
    .map(errors => errors.length > 0 ? [new ContextFailedToValidateResult(context.name, errors)] : [new ContextSuccessfullyValidatedResult(context.name)])

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

