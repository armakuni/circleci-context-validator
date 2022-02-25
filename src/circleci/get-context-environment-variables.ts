import {APIRequest, createRequest} from './v2-api'
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

export const getContextEnvironmentVariablesPath =
  (contextId: string): string => `context/${contextId}/environment-variable`

export const getContextEnvironmentVariablesValidator: Validator<GetContextEnvironmentVariablesResponse> =
  validateWithJsonSchema(schema)

export const getContextEnvironmentVariables =
  (ownerId: string): APIRequest<GetContextEnvironmentVariablesResponse> =>
    createRequest(
      getContextEnvironmentVariablesPath(ownerId),
      getContextEnvironmentVariablesValidator,
    )
