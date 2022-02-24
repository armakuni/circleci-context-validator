import {Config} from './config'
import {schema} from './schema'
import {validateWithJsonSchema, Validator} from '../validator'

export const validate: Validator<Config> = validateWithJsonSchema(schema)
