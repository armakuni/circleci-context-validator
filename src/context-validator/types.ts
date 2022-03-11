export type ContextValidatorResult = ContextMissingResult | ContextValidatedResult

export class ContextValidatedResult {
  //Used for comparison purposes only
  private readonly tag = 'ContextValidatedResult'
  // eslint no-useless-constructor: "off"
  constructor(public readonly contextName: string) {}
}

export class ContextMissingResult {
  private readonly tag = 'ContextMissingResult'
  constructor(public readonly contextName: string) {} // eslint no-useless-constructor
}
