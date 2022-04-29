import {constantResponseRequest, sequenceRequest} from '../../src/circleci'
import {expect} from 'chai'

describe('v2-api', () => {
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
