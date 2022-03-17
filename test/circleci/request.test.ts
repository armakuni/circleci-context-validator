import {chainRequest, constantResponseRequest, mapRequest, sequenceRequest} from '../../src/circleci'
import {expect} from 'chai'

describe('v2-api', () => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const fetcher = () => Promise.resolve('')

  describe('mapRequest', () => {
    it('maps the response', () => {
      const request = constantResponseRequest('response')
      const response = mapRequest(x => `mapped ${x}`, request)(fetcher)
      return expect(response).to.eventually.eql('mapped response')
    })
  })

  describe('chainRequest', () => {
    it('chains the response', () => {
      const request = constantResponseRequest('response')
      const f = (response: string) => constantResponseRequest(`chained ${response}`)
      const response = chainRequest(f, request)(fetcher)
      return expect(response).to.eventually.eql('chained response')
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
