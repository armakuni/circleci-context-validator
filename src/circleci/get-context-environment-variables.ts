import * as API from './v2-api'
import {validateWithJsonSchema, SchemaValidator} from '../schema-validator'
import {JSONSchemaType} from 'ajv'
import {PaginatedResponse, paginatedSchema} from './pagination'
import {APIRequest} from './request'

export type GetContextEnvironmentVariablesResponse = PaginatedResponse<FetchedEnvVar>

export interface FetchedEnvVar {
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

export const getPath: (_: string) => string =
  contextId => `context/${contextId}/environment-variable`

export const validate: SchemaValidator<GetContextEnvironmentVariablesResponse> =
  validateWithJsonSchema(schema)

export const createRequest: (_: string) => APIRequest<GetContextEnvironmentVariablesResponse> =
  contextId => API.createRequest(getPath(contextId), validate)
