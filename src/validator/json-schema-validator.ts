import Ajv, {ErrorObject, JSONSchemaType} from 'ajv'
import betterAjvErrors from 'better-ajv-errors'
import {Validator, ValidatorError} from './types'

export function validateWithJsonSchema<T>(schema: JSONSchemaType<T>): Validator<T> {
  return (response: any) => {
    const ajv = new Ajv({allErrors: true})
    const validate = ajv.compile(schema)
    const valid = validate(response)

    if (!valid) {
      const output = betterAjvErrors(schema, response, validate.errors as ErrorObject[])

      throw new ValidatorError(output)
    }

    return response
  }
}
