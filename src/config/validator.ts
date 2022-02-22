import {Config} from './config'
import Ajv, {ErrorObject} from 'ajv'
import {schema} from './schema'
import betterAjvErrors from 'better-ajv-errors'

export function validate(input: unknown): Config {
  const ajv = new Ajv({allErrors: true})

  const validate = ajv.compile(schema)
  const valid = validate(input)

  if (!valid) {
    const output = betterAjvErrors(schema, input, validate.errors as ErrorObject[])

    throw new Error(output)
  }

  return input
}
