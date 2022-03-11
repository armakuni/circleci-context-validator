import {Config} from './config'
import {schema} from './schema'
import {validateWithJsonSchema, Validator} from '../schema-validator'

export const validateConfig: Validator<Config> = validateWithJsonSchema(schema)
