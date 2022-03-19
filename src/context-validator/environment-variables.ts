import {ExpectedEnvVarBlock, ExpectedEnvVar} from '../config/config'
import {FetchedEnvVar} from '../circleci/get-context-environment-variables'
import {EnvVarValidationError, MissingEnvVarError, UnexpectedEnvVarError} from './types'

export type AnalysedEnvVar = AnalysedExpectedEnvVar | UnexpectedEnvVar

interface AnalysedExpectedEnvVar extends ExpectedEnvVar {
  name: string
  exists: boolean
  expected: true
}

interface UnexpectedEnvVar {
  name: string
  exists: true
  expected: false
}

export type Validator = (_: AnalysedEnvVar) => EnvVarValidationError[]

export type Analyser = (_: FetchedEnvVar[]) => AnalysedEnvVar[]

export const validateSingle: Validator =
  ({name, exists, expected}) =>
    expected ? (exists ? [] : [new MissingEnvVarError(name)]) : [new UnexpectedEnvVarError(name)]

export const analyseAll: (context: ExpectedEnvVarBlock) => Analyser =
  expectedEnvVars => fetchedEnvVars => {
    const existingEnvVars = new Set(fetchedEnvVars.map(env => env.variable))

    const expected: AnalysedExpectedEnvVar[] = Object
    .entries(expectedEnvVars)
    .map(([envVarName, envVar]) => ({name: envVarName, ...envVar}))
    .map(envVar => ({exists: existingEnvVars.has(envVar.name), expected: true, ...envVar}))

    const expectedLookup = new Set(Object.keys(expectedEnvVars))
    const missing: UnexpectedEnvVar[] = fetchedEnvVars
    .map(envVar => envVar.variable)
    .filter(name => !expectedLookup.has(name))
    .map(name => ({name, exists: true, expected: false}))

    return [...expected, ...missing]
  }

export const validateAll: (analyzer: Analyser, validator: Validator) => (_: FetchedEnvVar[]) => EnvVarValidationError[] =
  (analyse, validate) => fetchedEnvVars => {
    const errors = analyse(fetchedEnvVars).flatMap(envVar => validate(envVar))
    return [...errors]
  }
