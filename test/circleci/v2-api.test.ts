import * as nock from 'nock'
import {createFetcher, createRequest} from '../../src/circleci/v2-api'
import {Validator, ValidatorError} from '../../src/validator'
import {expect} from 'chai'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {ApiRequestError, BadApiResponseDataError} from '../../src/circleci'

chai.use(chaiAsPromised)

describe('v2-api', () => {
  describe('v2ApiFetcher', () => {
    const fetcher = createFetcher('access-token')

    it('throws when response is not 200', () => {
      nock('https://circleci.com')
      .get('/api/v2/example-resource')
      .matchHeader('circle-token', 'access-token')
      .reply(500, {message: 'error'})

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const validateSuccess: Validator<string> = () => 'success'

      return expect(createRequest('example-resource', validateSuccess)(fetcher))
      .to.be.rejectedWith(ApiRequestError, 'Failed to make request to CircleCI API: [500] {"message":"error"}')
    })

    it('throws when response is not 200', () => {
      nock('https://circleci.com')
      .get('/api/v2/example-resource')
      .matchHeader('circle-token', 'access-token')
      .reply(200, {})

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const validateFailure: Validator<string> = () => {
        throw new ValidatorError('failed')
      }

      return expect(createRequest('example-resource', validateFailure)(fetcher))
      .to.be.rejectedWith(BadApiResponseDataError, 'failed')
    })

    it('returns the validated response', () => {
      nock('https://circleci.com')
      .get('/api/v2/example-resource')
      .matchHeader('circle-token', 'access-token')
      .reply(200, {message: 'hello'})

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const messageValidator: Validator<{message: string}> = (input: any) => input

      return expect(createRequest('example-resource', messageValidator)(fetcher))
      .to.eventually.eql({message: 'hello'})
    })
  })
})
