import {describe} from 'mocha'
import {createRequest, getRequestParams, validate} from '../../src/circleci/get-contexts'
import {expect} from 'chai'
import {SchemaValidatorError} from '../../src/schema-validator'
import {BadApiResponseDataError, RequestParams} from '../../src/circleci'
import {APIFetcher} from '../../src/circleci/api-fetcher'

describe('get-contexts', () => {
  describe('getPath', () => {
    it('returns the path with the owner id', () => {
      expect(getRequestParams('abc-123')).to.eql({path: 'context', params: {'owner-id': 'abc-123'}})
    })
  })

  describe('validate', () => {
    let response: any

    beforeEach(() => {
      response = {
        next_page_token: null, // eslint-disable-line camelcase
        items: [{
          name: 'context-one',
          id: '00a9f111-55f6-46b9-8b85-57845802075d',
          created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
        }, {
          name: 'context-two',
          id: '222db7a8-f9e9-41d7-a1a9-e3ba1b4e0cd5',
          created_at: '2021-09-02T14:42:20.126Z', // eslint-disable-line camelcase
        }],
      }
    })

    it('throws when items is missing', () => {
      delete response.items
      expect(() => validate(response))
      .to.throw(SchemaValidatorError, /must have required property 'items'/)
    })

    it('throws when name is missing from a context', () => {
      delete response.items[0].name
      expect(() => validate(response))
      .to.throw(SchemaValidatorError, /must have required property 'name'/)
    })

    it('throws when id is missing from a context', () => {
      delete response.items[0].id
      expect(() => validate(response))
      .to.throw(SchemaValidatorError, /must have required property 'id'/)
    })

    it('returns the response', () => {
      expect(validate(response)).to.eq(response)
    })
  })

  describe('createRequests', () => {
    const response = {
      next_page_token: null, // eslint-disable-line camelcase
      items: [{
        name: 'context-one',
        id: '00a9f111-55f6-46b9-8b85-57845802075d',
        created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
      }],
    }

    const fetcher: APIFetcher = (requestParams: RequestParams) => {
      const expectedParams = getRequestParams('example-owner-id')
      if (JSON.stringify(requestParams) !== JSON.stringify(expectedParams)) {
        throw new BadApiResponseDataError(`${requestParams} != ${expectedParams}`)
      }

      return Promise.resolve(response)
    }

    it('build a fetcher which returns the valid response', () => {
      return expect(createRequest('example-owner-id')(fetcher)).to.eventually.eql(response)
    })
  })
})
