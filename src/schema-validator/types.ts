export type SchemaValidator<T> = (response: any) => T

export class SchemaValidatorError extends Error {}
