import {validateWithJsonSchema, SchemaValidator} from '../schema-validator'
import {JSONSchemaType} from 'ajv'
import * as API from './v2-api'
import {PaginatedResponse, paginatedSchema} from './pagination'
import {APIRequest} from './request'

export type GetContextsResponse = PaginatedResponse<FetchedContext>

export interface FetchedContext {
  name: string
  id: string
}

const schema: JSONSchemaType<GetContextsResponse> =
  paginatedSchema({
    type: 'object',
    required: ['id', 'name'],
    additionalProperties: true,
    properties: {
      name: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
    },
  })

export const getPath: (_: string) => string =
  ownerId => `context?owner-id=${ownerId}`

export const validate: SchemaValidator<GetContextsResponse> =
  validateWithJsonSchema(schema)

export const createRequest: (_: string) => APIRequest<GetContextsResponse> =
  ownerId => API.createRequest(getPath(ownerId), validate)
