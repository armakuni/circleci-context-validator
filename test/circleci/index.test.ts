import * as nock from 'nock'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {ApiRequestError, BadApiResponseDataError} from '../../src/circleci/types'
import {fetchContexts} from '../../src/circleci'

chai.use(chaiAsPromised)

describe('circleci', () => {
  describe('fetchContexts', () => {
    it('throws when 500 error returned when fetching the list of contexts', () => {
      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': '88025e7e-1268-4491-8756-221970905a18'})
      .matchHeader('circle-token', 'example-token')
      .reply(500, 'an error occurred')

      return expect(fetchContexts('88025e7e-1268-4491-8756-221970905a18', 'example-token'))
      .to.be.rejectedWith(ApiRequestError, 'Failed to make request to CircleCI API: [500] an error occurred')
    })

    it('throws when 401 error returned', () => {
      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': '88025e7e-1268-4491-8756-221970905a18'})
      .matchHeader('circle-token', 'example-token')
      .reply(401, 'not authorized')

      return expect(fetchContexts('88025e7e-1268-4491-8756-221970905a18', 'example-token'))
      .to.be.rejectedWith(ApiRequestError, 'Failed to make request to CircleCI API: [401] not authorized')
    })

    it('throws when items is missing', () => {
      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': '88025e7e-1268-4491-8756-221970905a18'})
      .matchHeader('circle-token', 'example-token')
      .reply(200, {})

      return expect(fetchContexts('88025e7e-1268-4491-8756-221970905a18', 'example-token'))
      .to.be.rejectedWith(BadApiResponseDataError, /must have required property 'items'/)
    })

    it('throws when name is missing from a context', () => {
      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': '88025e7e-1268-4491-8756-221970905a18'})
      .matchHeader('circle-token', 'example-token')
      .reply(200,     {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [{
          id: '00a9f111-55f6-46b9-8b85-57845802075d',
          created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
        }],
      })

      return expect(fetchContexts('88025e7e-1268-4491-8756-221970905a18', 'example-token'))
      .to.be.rejectedWith(BadApiResponseDataError, /must have required property 'name'/)
    })

    it('throws when id is missing from a context', () => {
      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': '88025e7e-1268-4491-8756-221970905a18'})
      .matchHeader('circle-token', 'example-token')
      .reply(200,     {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [{
          name: 'context-one',
          created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
        }],
      })

      return expect(fetchContexts('88025e7e-1268-4491-8756-221970905a18', 'example-token'))
      .to.be.rejectedWith(BadApiResponseDataError, /must have required property 'id'/)
    })

    it('returns the list of contexts', () => {
      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': '88025e7e-1268-4491-8756-221970905a18'})
      .matchHeader('circle-token', 'example-token')
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

      return expect(fetchContexts('88025e7e-1268-4491-8756-221970905a18', 'example-token'))
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
