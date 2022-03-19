import {ExpectedContext} from '../config/config'

export type ContextValidatorResult = ContextMissingResult | ContextSuccessfullyValidatedResult | ContextEnvVarMissingResult

export class ContextSuccessfullyValidatedResult {
  // Used for comparison purposes only
  private readonly tag = 'ContextSuccessfullyValidatedResult'
  // eslint no-useless-constructor: "off"
  constructor(public readonly contextName: string) {}
}

export class ContextMissingResult {
  private readonly tag = 'ContextMissingResult'
  constructor(public readonly contextName: string) {} // eslint no-useless-constructor
}

export class ContextEnvVarMissingResult {
  private readonly tag = 'ContextEnvVarMissingResult'
  constructor(public readonly contextName: string, public readonly envVarName: string) {} // eslint no-useless-constructor
}

export interface IdentifiedContext extends ExpectedContext {
  id: string
}
