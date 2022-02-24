import {validateWithJsonSchema, Validator} from '../validator'
import {JSONSchemaType} from 'ajv'
import {v2ApiFetcher, V2APIRequester} from './v2-api'

export interface GetContextsResponse {
  items: ContextItem[]
}

export interface ContextItem {
  name: string
  id: string
}

const getContextsResponseSchema: JSONSchemaType<GetContextsResponse> = {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Root',
  type: 'object',
  required: ['items'],
  additionalProperties: true,
  properties: {
    items: {
      title: 'Contexts',
      type: 'array',
      default: [],
      items: {
        title: 'Items',
        type: 'object',
        required: ['id', 'name'],
        additionalProperties: true,
        properties: {
          name: {
            title: 'Name',
            type: 'string',
          },
          id: {
            title: 'ID',
            type: 'string',
          },
        },
      },
    },
  },
}

const getContextsPath = (ownerId: string) => `context?owner-id=${ownerId}`

const getContextsResponseValidator: Validator<GetContextsResponse> = validateWithJsonSchema(getContextsResponseSchema)

export const getContexts = (ownerId: string): V2APIRequester<GetContextsResponse> => v2ApiFetcher(
  getContextsPath(ownerId),
  getContextsResponseValidator,
)
