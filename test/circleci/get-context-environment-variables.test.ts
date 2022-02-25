import {describe} from 'mocha'
import {expect} from 'chai'
import {
  getContextEnvironmentVariables,
  getContextEnvironmentVariablesPath,
  getContextEnvironmentVariablesValidator,
} from '../../src/circleci/get-context-environment-variables'
import {ValidatorError} from '../../src/validator'
import {APIFetcher} from '../../src/circleci/v2-api'
import {BadApiResponseDataError} from '../../src/circleci'

describe('get-context-environment-variables', () => {
  describe('getContextEnvironmentVariablesPath', () => {
    it('returns the path with the context variable', () => {
      const contextId = 'ff2b03cd-c4eb-48f1-8892-c83074b90e6d'
      expect(getContextEnvironmentVariablesPath(contextId)).to.eql(`context/${contextId}/environment-variable`)
    })
  })

  describe('getContextEnvironmentVariablesValidator', () => {
    const contextId = '2a532969-c93d-43df-b7cf-554aaa0d10fa'

    let response: any

    beforeEach(() => {
      response = {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
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
      expect(() => getContextEnvironmentVariablesValidator(response))
      .to.throw(ValidatorError, /must have required property 'items'/)
    })

    it('throws when variable is missing from a context', () => {
      delete response.items[0].variable
      expect(() => getContextEnvironmentVariablesValidator(response))
      .to.throw(ValidatorError, /must have required property 'variable'/)
    })

    it('returns the response', () => {
      expect(getContextEnvironmentVariablesValidator(response)).to.eq(response)
    })
  })

  describe('getContextEnvironmentVariables', () => {
    const contextId = '68c76415-c1a4-44b8-b205-f4ede7ea6d68'
    const response = {
      next_page_token: 'next-page-token', // eslint-disable-line camelcase
      items: [{
        variable: 'SECRET_ONE',
        context_id: contextId, // eslint-disable-line camelcase
        created_at: '2020-10-14T09:16:29.036Z', // eslint-disable-line camelcase
      }],
    }

    const fetcher: APIFetcher = (path: string) => {
      const expectedPath = getContextEnvironmentVariablesPath(contextId)
      if (path !== expectedPath) {
        throw new BadApiResponseDataError(`${path} != ${expectedPath}`)
      }

      return Promise.resolve(response)
    }

    it('build a fetcher which returns the valid response', () => {
      return expect(getContextEnvironmentVariables(contextId)(fetcher)).to.eventually.eql(response)
    })
  })
})
