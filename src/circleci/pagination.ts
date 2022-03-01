import {JSONSchemaType} from 'ajv'

export interface PaginatedResponse<Item> {
  // eslint-disable-next-line camelcase
  next_page_token: string
  items: Item[]
}

export function paginatedSchema<Item>(itemSchema: JSONSchemaType<Item>): JSONSchemaType<PaginatedResponse<Item>> {
  return {
    type: 'object',
    required: ['next_page_token', 'items'],
    additionalProperties: true,
    properties: {
      next_page_token: { // eslint-disable-line camelcase
        type: 'string',
      },
      items: {
        type: 'array',
        items: itemSchema,
      },
    },
  }
}
