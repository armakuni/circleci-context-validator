import * as API from './v2-api'
import {validateWithJsonSchema, SchemaValidator} from '../schema-validator'
import {JSONSchemaType} from 'ajv'
import {PaginatedResponse, paginatedSchema} from './pagination'
import {APIRequest} from './api-request'
import {RequestParams} from './api-fetcher'

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

export const getRequestParams = (contextId: string): RequestParams =>
  ({path: `context/${contextId}/environment-variable`, params: {}})

export const validate: SchemaValidator<GetContextEnvironmentVariablesResponse> =
  validateWithJsonSchema(schema)

export const createRequest = (contextId: string): APIRequest<GetContextEnvironmentVariablesResponse> =>
  API.createRequest(getRequestParams(contextId), validate)
