import * as nock from 'nock'
import {Interceptor} from 'nock'
import {expect} from 'chai'
import {ApiRequestError, BadApiResponseDataError, fetchContexts} from '../../src/circleci'

describe('circleci', () => {
  describe('fetchContexts', () => {
    const ownerId = '97223a6b-3090-47ce-94b0-485ce0a38e62'

    let mockRequest: Interceptor

    beforeEach(() => {
      mockRequest = nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': ownerId})
      .matchHeader('circle-token', 'example-token')
    })

    it('throws when 500 error returned when fetching the list of contexts', () => {
      mockRequest.reply(500, 'an error occurred')

      return expect(fetchContexts(ownerId, 'example-token'))
      .to.be.rejectedWith(ApiRequestError, 'Failed to make request to CircleCI API: [500] an error occurred')
    })

    it('throws when 401 error returned', () => {
      mockRequest
      .reply(401, 'not authorized')

      return expect(fetchContexts(ownerId, 'example-token'))
      .to.be.rejectedWith(ApiRequestError, 'Failed to make request to CircleCI API: [401] not authorized')
    })

    it('throws when response is invalid is missing', () => {
      mockRequest
      .reply(200, {})

      return expect(fetchContexts(ownerId, 'example-token'))
      .to.be.rejectedWith(BadApiResponseDataError, /must have required property 'items'/)
    })

    it('returns the list of contexts', () => {
      mockRequest
      .reply(200,     {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [{
          name: 'context-one',
          id: '00a9f111-55f6-46b9-8b85-57845802075d',
          created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
        }, {
          name: 'context-two',
          id: '222db7a8-f9e9-41d7-a1a9-e3ba1b4e0cd5',
          created_at: '2021-09-02T14:42:20.126Z', // eslint-disable-line camelcase
        }],
      })

      return expect(fetchContexts(ownerId, 'example-token'))
      .to.eventually.eql([
        {
          name: 'context-one',
          id: '00a9f111-55f6-46b9-8b85-57845802075d',
          created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
        },
        {
          name: 'context-two',
          id: '222db7a8-f9e9-41d7-a1a9-e3ba1b4e0cd5',
          created_at: '2021-09-02T14:42:20.126Z', // eslint-disable-line camelcase
        },
      ])
    })
  })
})
