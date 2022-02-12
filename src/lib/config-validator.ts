import Ajv, {ErrorObject} from 'ajv'
import * as schema from '../config/context_validator_schema.json'
import betterAjvErrors from 'better-ajv-errors'
import {Config} from '../config/config'

export default function isValid(jsonProjectConfigContents: Config | unknown): jsonProjectConfigContents is Config {
  // Schema validator to include all errors, not fail at the first.
  const ajv =  new Ajv({allErrors: true})

  // Load in users context validator config file parse into data JS data structure
  console.log(JSON.stringify(jsonProjectConfigContents, null, '\t'))

  // compile schema for validation
  const validate = ajv.compile(schema)

  const valid = validate(jsonProjectConfigContents)

  if (!valid) {
    console.log('Errored :(', validate.errors as ErrorObject[])

    const output = betterAjvErrors(schema, jsonProjectConfigContents, validate.errors as ErrorObject[])
    throw new Error(output)
  }

  return true
}
