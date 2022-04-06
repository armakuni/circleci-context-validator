import * as API from './v2-api'
import {APIRequest} from './v2-api'
import {validateWithJsonSchema, SchemaValidator} from '../schema-validator'
import {JSONSchemaType} from 'ajv'
import {PaginatedResponse, paginatedSchema} from './pagination'

export type GetContextEnvironmentVariablesResponse = PaginatedResponse<EnvironmentVariable>

export interface EnvironmentVariable {
  variable: string
}

const schema: JSONSchemaType<GetContextEnvironmentVariablesResponse> =
  paginatedSchema({
    type: 'object',
    required: ['variable'],
    additionalProperties: true,
    properties: {
      variable: {
        type: 'string',
      },
    },
  })

export const getPath =
  (contextId: string): string => `context/${contextId}/environment-variable`

export const validate: SchemaValidator<GetContextEnvironmentVariablesResponse> =
  validateWithJsonSchema(schema)

export const createRequest =
  (contextId: string): APIRequest<GetContextEnvironmentVariablesResponse> =>
    API.createRequest(
      getPath(contextId),
      validate,
    )
