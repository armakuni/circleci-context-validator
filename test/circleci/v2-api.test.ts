import * as nock from 'nock'
import {
  ApiRequestError,
  BadApiResponseDataError,
  constantResponseRequest,
  createFetcher,
  createRequest,
  sequenceRequest,
} from '../../src/circleci'
import {SchemaValidator, SchemaValidatorError} from '../../src/schema-validator'
import {expect} from 'chai'
import {mockFetcher} from '../helpers/mock-api'

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

      return expect(createRequest({path: 'example-resource', params: {}}, validateSuccess)(fetcher))
      .to.be.rejectedWith(ApiRequestError, 'Failed to make request to CircleCI API: [500] {"message":"error"}')
    })

    it('throws when validate fails', () => {
      const fetcher = mockFetcher([
        {
          requestParams: {
            path: 'example-resource',
            params: {},
          },
          response: {},
        },
      ])

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const validateFailure: SchemaValidator<string> = () => {
        throw new SchemaValidatorError('failed')
      }

      return expect(createRequest({path: 'example-resource', params: {}}, validateFailure)(fetcher))
      .to.be.rejectedWith(BadApiResponseDataError, 'failed')
    })

    it('re-throws when validate fails unexpectedly', () => {
      const fetcher = mockFetcher([
        {
          requestParams: {
            path: 'example-resource',
            params: {},
          },
          response: {},
        },
      ])

      const validateFailure: SchemaValidator<string> = () => {
        throw new Error('not a validate error')
      }

      return expect(createRequest({path: 'example-resource', params: {}}, validateFailure)(fetcher))
      .to.be.rejectedWith(Error, 'not a validate error')
    })

    it('returns the validated response', () => {
      const fetcher = mockFetcher([
        {
          requestParams: {
            path: 'example-resource',
            params: {},
          },
          response: {message: 'hello'},
        },
      ])

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const messageValidator: SchemaValidator<{message: string}> = (input: any) => input

      return expect(createRequest({path: 'example-resource', params: {}}, messageValidator)(fetcher))
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
