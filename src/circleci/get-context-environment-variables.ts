import * as API from './v2-api'
import {APIRequest} from './v2-api'
import {validateWithJsonSchema, Validator} from '../validator'
import {JSONSchemaType} from 'ajv'

export interface GetContextEnvironmentVariablesResponse {
  items: EnvironmentVariable[]
}

export interface EnvironmentVariable {
  variable: string
}

const schema: JSONSchemaType<GetContextEnvironmentVariablesResponse> = {
  type: 'object',
  required: ['items'],
  additionalProperties: true,
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['variable'],
        additionalProperties: true,
        properties: {
          variable: {
            type: 'string',
          },
        },
      },
    },
  },
}

export const getPath =
  (contextId: string): string => `context/${contextId}/environment-variable`

export const validate: Validator<GetContextEnvironmentVariablesResponse> =
  validateWithJsonSchema(schema)

export const createRequest =
  (contextId: string): APIRequest<GetContextEnvironmentVariablesResponse> =>
    API.createRequest(
      getPath(contextId),
      validate,
    )
