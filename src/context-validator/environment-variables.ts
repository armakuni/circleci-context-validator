import {ExpectedEnvVarBlock, ExpectedEnvVar} from '../config/config'
import {FetchedEnvVar} from '../circleci/get-context-environment-variables'
import {EnvVarValidationError, MissingEnvVarError} from './types'

export interface AnalysedEnvVar extends ExpectedEnvVar {
  name: string
  exists: boolean
}

export type Validator = (_: AnalysedEnvVar) => EnvVarValidationError[]

export type Analyser = (_: FetchedEnvVar[]) => AnalysedEnvVar[]

const listOrDefault: <T extends any[]>(list: T, defaultList: T) => T =
  (list, defaultList) =>
    list.length > 0 ? list : defaultList

export const validateSingle: Validator =
  ({name, exists}) =>
    exists ? [] : [new MissingEnvVarError(name)]

export const analyseAll: (context: ExpectedEnvVarBlock) => Analyser =
  expectedEnvVars => fetchedEnvVars => {
    const existingEnvVars = new Set(fetchedEnvVars.map(env => env.variable))
    return Object
    .entries(expectedEnvVars)
    .map(([envVarName, envVar]) => ({name: envVarName, ...envVar}))
    .map(envVar => ({exists: existingEnvVars.has(envVar.name), ...envVar}))
  }

export const validateAll: (analyzer: Analyser, validator: Validator) => (_: FetchedEnvVar[]) => EnvVarValidationError[] =
  (analyse, validate) => fetchedEnvVars =>
    listOrDefault(
      analyse(fetchedEnvVars).flatMap(envVar => validate(envVar)),
      [],
    )
