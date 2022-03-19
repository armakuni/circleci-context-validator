import {ExpectedContext} from '../config/config'

export type ContextValidatorResult =
  ContextMissingResult |
  ContextSuccessfullyValidatedResult |
  ContextFailedToValidateResult

export class ContextSuccessfullyValidatedResult {
  // Used for comparison purposes only
  private readonly tag = 'ContextSuccessfullyValidatedResult'
  // eslint no-useless-constructor: "off"
  constructor(public readonly contextName: string) {}
}

export class ContextFailedToValidateResult {
  private readonly tag = 'ContextFailedToValidateResult'
  constructor(
    public readonly contextName: string,
    public readonly errors: EnvVarValidationError[],
  ) {}
}

export class ContextMissingResult {
  private readonly tag = 'ContextMissingResult'
  constructor(public readonly contextName: string) {} // eslint no-useless-constructor
}

export type EnvVarValidationError = MissingEnvVarError | UnexpectedEnvVarError

export class UnexpectedEnvVarError {
  private readonly tag = 'UnexpectedEnvVarError'
  constructor(public readonly envVarName: string) {} // eslint no-useless-constructor
}

export class MissingEnvVarError {
  private readonly tag = 'MissingEnvVarError'
  constructor(public readonly envVarName: string) {} // eslint no-useless-constructor
}

export interface IdentifiedContext extends ExpectedContext {
  id: string
}
