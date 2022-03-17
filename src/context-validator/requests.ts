import {ExpectedContext} from '../config/config'
import {FetchedEnvVar} from '../circleci/get-context-environment-variables'
import {ContextMissingResult, ContextValidatorResult} from './types'
import * as EnvVars from './environment-variables'
import {
  APIRequest,
  constantResponseRequest,
  FetchedContext,
  GetContextEnvironmentVariables,
} from '../circleci'

interface IdentifiedContext extends ExpectedContext {
  id: string
}

type CreateMissingContextRequest = (_: ExpectedContext) => APIRequest<ContextValidatorResult[]>

type CreateValidateContextRequest = (_: IdentifiedContext) => APIRequest<ContextValidatorResult[]>

const validateAllContextEnvVars: (_: ExpectedContext) => (_: FetchedEnvVar[]) => ContextValidatorResult[] =
  context =>
    EnvVars.validateAll(context)(EnvVars.analyseAll(context), EnvVars.validateSingle(context))

export const missingContext: CreateMissingContextRequest =
  context => constantResponseRequest([new ContextMissingResult(context.name)])

export const fetchContextAndValidate: (_: GetContextEnvironmentVariables) => CreateValidateContextRequest =
  getContextEnvironmentVariables => context =>
    getContextEnvironmentVariables(context.id).map(validateAllContextEnvVars(context))

const contextIds: (_: FetchedContext[]) => Map<string, string> =
  contexts =>
    new Map(contexts.map(context => [context.name, context.id]))

export const fetchAllContextsAndValidate:
  (validate: CreateValidateContextRequest, missing: CreateMissingContextRequest, _: ExpectedContext[]) =>
    (actualContexts: FetchedContext[]) =>
      APIRequest<ContextValidatorResult[]>[] =
  (createFetchContextAndValidateRequest, createMissingContextRequest, expectedContexts) => actualContexts => {
    const withId = expectedContexts.map(context => ({...context, id: contextIds(actualContexts).get(context.name)}))
    const missing = withId.filter(context => context.id === undefined).map(context => createMissingContextRequest(context))
    const existing = withId.filter(context => context.id !== undefined).map(context => createFetchContextAndValidateRequest(context as IdentifiedContext))

    return [...missing, ...existing]
  }
