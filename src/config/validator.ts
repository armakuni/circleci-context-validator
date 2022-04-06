import {Config} from './config'
import {schema} from './schema'
import {validateWithJsonSchema, SchemaValidator} from '../schema-validator'

export const validateConfig: SchemaValidator<Config> = validateWithJsonSchema(schema)
