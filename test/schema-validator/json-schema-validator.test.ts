import {validateWithJsonSchema, ValidatorError} from '../../src/schema-validator'
import {JSONSchemaType} from 'ajv'
import {expect} from 'chai'

describe('json-schema-validator', () => {
  describe('validateWithJsonSchema', () => {
    interface Message { message: string }

    const schema: JSONSchemaType<Message> = {
      type: 'object',
      required: ['message'],
      properties: {
        message: {type: 'string'},
      },
    }

    const validate = validateWithJsonSchema(schema)

    it('returns the input when valid', () => {
      expect(validate({message: 'hello'})).to.eql({message: 'hello'})
    })

    it('throws when the input in invalid', () => {
      expect(() => validate({})).to.throw(ValidatorError, /must have required property 'message'/)
    })
  })
})
