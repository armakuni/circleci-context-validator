import {Config} from './config'
import {schema} from './schema'
import {validateWithJsonSchema, Validator} from '../validator'

export const validateConfig: Validator<Config> = validateWithJsonSchema(schema)
