export type ContextValidatorResult = ContextMissingResult | ContextValidatedResult

export class ContextValidatedResult {
  // eslint no-useless-constructor: "off"
  constructor(public readonly contextName: string) {}
}

export class ContextMissingResult {
  constructor(public readonly contextName: string) {} // eslint no-useless-constructor
}
