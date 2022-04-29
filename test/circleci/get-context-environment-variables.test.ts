import {describe} from 'mocha'
import {expect} from 'chai'
import {
  createRequest,
  getRequestParams,
  validate,
} from '../../src/circleci/get-context-environment-variables'
import {SchemaValidatorError} from '../../src/schema-validator'
import {BadApiResponseDataError, RequestParams} from '../../src/circleci'
import {APIFetcher} from '../../src/circleci/api-fetcher'

describe('get-context-environment-variables', () => {
  describe('getPath', () => {
    it('returns the path with the context variable', () => {
      const contextId = 'ff2b03cd-c4eb-48f1-8892-c83074b90e6d'
      expect(getRequestParams(contextId)).to.eql({path: `context/${contextId}/environment-variable`, params: {}})
    })
  })

  describe('validate', () => {
    const contextId = '2a532969-c93d-43df-b7cf-554aaa0d10fa'

    let response: any

    beforeEach(() => {
      response = {
        next_page_token: null, // eslint-disable-line camelcase
        items: [{
          variable: 'SECRET_ONE',
          context_id: contextId, // eslint-disable-line camelcase
          created_at: '2020-10-14T09:16:29.036Z', // eslint-disable-line camelcase
        }, {
          variable: 'SECRET_TWO',
          context_id: contextId, // eslint-disable-line camelcase
          created_at: '2020-10-14T09:16:38.330Z', // eslint-disable-line camelcase
        }],
      }
    })

    it('throws when items is missing', () => {
      delete response.items
      expect(() => validate(response))
      .to.throw(SchemaValidatorError, /must have required property 'items'/)
    })

    it('throws when variable is missing from a context', () => {
      delete response.items[0].variable
      expect(() => validate(response))
      .to.throw(SchemaValidatorError, /must have required property 'variable'/)
    })

    it('returns the response', () => {
      expect(validate(response)).to.eq(response)
    })
  })

  describe('createRequest', () => {
    const contextId = '68c76415-c1a4-44b8-b205-f4ede7ea6d68'
    const response = {
      next_page_token: null, // eslint-disable-line camelcase
      items: [{
        variable: 'SECRET_ONE',
        context_id: contextId, // eslint-disable-line camelcase
        created_at: '2020-10-14T09:16:29.036Z', // eslint-disable-line camelcase
      }],
    }

    const fetcher: APIFetcher = (requestParams: RequestParams) => {
      const expectedParams = getRequestParams(contextId)
      if (JSON.stringify(requestParams) !== JSON.stringify(expectedParams)) {
        throw new BadApiResponseDataError(`${JSON.stringify(requestParams)} !== ${JSON.stringify(expectedParams)}`)
      }

      return Promise.resolve(response)
    }

    it('build a fetcher which returns the valid response', () => {
      return expect(createRequest(contextId)(fetcher)).to.eventually.eql(response)
    })
  })
})
