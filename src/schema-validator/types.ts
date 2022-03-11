export type Validator<T> = (response: any) => T

export class ValidatorError extends Error {}
