import * as nock from 'nock'
import {createFetcher, createRequest} from '../../src/circleci/v2-api'
import {SchemaValidator, SchemaValidatorError} from '../../src/schema-validator'
import {expect} from 'chai'
import {ApiRequestError, BadApiResponseDataError} from '../../src/circleci'

describe('v2-api', () => {
  describe('createRequest', () => {
    const fetcher = createFetcher('access-token')

    it('throws when response is not 200', () => {
      nock('https://circleci.com')
      .get('/api/v2/example-resource')
      .matchHeader('circle-token', 'access-token')
      .reply(500, {message: 'error'})

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const validateSuccess: SchemaValidator<string> = () => 'success'

      return expect(createRequest('example-resource', validateSuccess)(fetcher))
      .to.be.rejectedWith(ApiRequestError, 'Failed to make request to CircleCI API: [500] {"message":"error"}')
    })

    it('throws when validate fails', () => {
      nock('https://circleci.com')
      .get('/api/v2/example-resource')
      .matchHeader('circle-token', 'access-token')
      .reply(200, {})

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const validateFailure: SchemaValidator<string> = () => {
        throw new SchemaValidatorError('failed')
      }

      return expect(createRequest('example-resource', validateFailure)(fetcher))
      .to.be.rejectedWith(BadApiResponseDataError, 'failed')
    })

    it('re-throws when validate fails unexpectedly', () => {
      nock('https://circleci.com')
      .get('/api/v2/example-resource')
      .matchHeader('circle-token', 'access-token')
      .reply(200, {})

      const validateFailure: SchemaValidator<string> = () => {
        throw new Error('not a validate error')
      }

      return expect(createRequest('example-resource', validateFailure)(fetcher))
      .to.be.rejectedWith(Error, 'not a validate error')
    })

    it('returns the validated response', () => {
      nock('https://circleci.com')
      .get('/api/v2/example-resource')
      .matchHeader('circle-token', 'access-token')
      .reply(200, {message: 'hello'})

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const messageValidator: SchemaValidator<{message: string}> = (input: any) => input

      return expect(createRequest('example-resource', messageValidator)(fetcher))
      .to.eventually.eql({message: 'hello'})
    })
  })
})
