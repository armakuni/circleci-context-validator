import {JSONSchemaType} from 'ajv'
import {expect} from 'chai'
import {paginatedSchema} from '../../src/circleci/pagination'

describe('pagination', () => {
  describe('paginatedSchema', () => {
    it('wraps the item schema', () => {
      interface ExampleItem {
        value: string
      }

      const exampleItemSchema: JSONSchemaType<ExampleItem> = {
        type: 'object',
        required: ['value'],
        properties: {
          value: {
            type: 'string',
          },
        },
      }

      expect(paginatedSchema(exampleItemSchema)).to.eql({
        type: 'object',
        required: ['next_page_token', 'items'],
        additionalProperties: true,
        properties: {
          next_page_token: { // eslint-disable-line camelcase
            type: 'string',
            nullable: true,
          },
          items: {
            type: 'array',
            items: exampleItemSchema,
          },
        },
      })
    })
  })
})
