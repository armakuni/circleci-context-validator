import {validateWithJsonSchema, SchemaValidator} from '../schema-validator'
import {JSONSchemaType} from 'ajv'
import * as API from './v2-api'
import {APIRequest, RequestParams} from './v2-api'
import {PaginatedResponse, paginatedSchema} from './pagination'

export type GetContextsResponse = PaginatedResponse<ContextItem>

export interface ContextItem {
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

export const getPath =
  (ownerId: string): RequestParams => ({
    path: 'context',
    params: {'owner-id': ownerId},
  })

export const validate: SchemaValidator<GetContextsResponse> =
  validateWithJsonSchema(schema)

export const createRequest =
  (ownerId: string): APIRequest<GetContextsResponse> => API.createRequest(
    getPath(ownerId),
    validate,
  )
