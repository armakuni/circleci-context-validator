import {validateWithJsonSchema, Validator} from '../validator'
import {JSONSchemaType} from 'ajv'
import * as API from './v2-api'
import {APIRequest} from './v2-api'

export interface GetContextsResponse {
  items: ContextItem[]
}

export interface ContextItem {
  name: string
  id: string
}

const schema: JSONSchemaType<GetContextsResponse> = {
  type: 'object',
  required: ['items'],
  additionalProperties: true,
  properties: {
    items: {
      type: 'array',
      default: [],
      items: {
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
      },
    },
  },
}

export const getPath =
  (ownerId: string): string => `context?owner-id=${ownerId}`

export const validate: Validator<GetContextsResponse> =
  validateWithJsonSchema(schema)

export const createRequest =
  (ownerId: string): APIRequest<GetContextsResponse> => API.createRequest(
    getPath(ownerId),
    validate,
  )
