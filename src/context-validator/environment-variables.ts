import {ExpectedContext, ExpectedEnvVar} from '../config/config'
import {FetchedEnvVar} from '../circleci/get-context-environment-variables'
import {ContextEnvVarMissingResult, ContextSuccessfullyValidatedResult, ContextValidatorResult} from './types'

export interface AnalysedEnvVar extends ExpectedEnvVar {
  name: string
  exists: boolean
}

type WithContext<T> = (context: ExpectedContext) => T

export type Validator = (_: AnalysedEnvVar) => ContextValidatorResult[]

export type Analyser = (_: FetchedEnvVar[]) => AnalysedEnvVar[]

const listOrDefault: <T extends any[]>(list: T, defaultList: T) => T =
  (list, defaultList) =>
    list.length > 0 ? list : defaultList

export const validateSingle: WithContext<Validator> =
  context => ({name, exists}) =>
    exists ? [] : [new ContextEnvVarMissingResult(context.name, name)]

export const analyseAll: WithContext<Analyser> =
  context => fetchedEnvVars => {
    const existingEnvVars = new Set(fetchedEnvVars.map(env => env.variable))
    return Object
    .entries(context['environment-variables'])
    .map(([envVarName, envVar]) => ({name: envVarName, ...envVar}))
    .map(envVar => ({exists: existingEnvVars.has(envVar.name), ...envVar}))
  }

export const validateAll: WithContext<(analyzer: Analyser, validator: Validator) => (_: FetchedEnvVar[]) => ContextValidatorResult[]> =
  context => (analyse, validate) => fetchedEnvVars =>
    listOrDefault(
      analyse(fetchedEnvVars).flatMap(envVar => validate(envVar)),
      [new ContextSuccessfullyValidatedResult(context.name)] as ContextValidatorResult[],
    )
