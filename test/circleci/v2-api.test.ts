import * as nock from 'nock'
import {
  constantResponseRequest,
  createFetcher,
  createRequest,
  sequenceRequest,
} from '../../src/circleci'
import {Validator, ValidatorError} from '../../src/schema-validator'
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
      const validateSuccess: Validator<string> = () => 'success'

      return expect(createRequest('example-resource', validateSuccess)(fetcher))
      .to.be.rejectedWith(ApiRequestError, 'Failed to make request to CircleCI API: [500] {"message":"error"}')
    })

    it('throws when validate fails', () => {
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

    it('re-throws when validate fails unexpectedly', () => {
      nock('https://circleci.com')
      .get('/api/v2/example-resource')
      .matchHeader('circle-token', 'access-token')
      .reply(200, {})

      const validateFailure: Validator<string> = () => {
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
      const messageValidator: Validator<{message: string}> = (input: any) => input

      return expect(createRequest('example-resource', messageValidator)(fetcher))
      .to.eventually.eql({message: 'hello'})
    })
  })

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const fetcher = () => Promise.resolve('')

  describe('.map', () => {
    it('maps the response', () => {
      const request = constantResponseRequest('response')
      const response = request.map(x => `mapped ${x}`)(fetcher)
      return expect(response).to.eventually.eql('mapped response')
    })
  })

  describe('.flatMap', () => {
    it('flatMaps the response', () => {
      const request = constantResponseRequest('response')
      const f = (response: string) => constantResponseRequest(`flatMapped ${response}`)
      const response = request.flatMap(element => f(element))(fetcher)
      return expect(response).to.eventually.eql('flatMapped response')
    })
  })

  describe('sequenceRequest', () => {
    it('creates a fetch which lists all reponses', () => {
      const request1 = constantResponseRequest('response1')
      const request2 = constantResponseRequest('response2')
      const response = sequenceRequest([request1, request2])(fetcher)
      return expect(response).to.eventually.eql(['response1', 'response2'])
    })
  })
})
