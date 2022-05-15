import {expect} from 'chai'
import {getContextsWithEnvVars} from '../../src/context-validator/request'
import {mockFetcher} from '../helpers/mock-api'

describe('getContextsWithEnvVars', () => {
  it('gets a requested contexts', () => {
    const fetcher = mockFetcher([
      {
        requestParams: {path: 'context', params: {'owner-id': '71362723'}},
        response: {
          next_page_token: null, // eslint-disable-line camelcase
          items: [{
            name: 'context-one',
            id: '00a9f111-55f6-46b9-8b85-57845802075d',
            created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
          }],
        }},
      {
        requestParams: {path: 'context/00a9f111-55f6-46b9-8b85-57845802075d/environment-variable', params: {}},
        response: {
          next_page_token: null, // eslint-disable-line camelcase
          items: [{
            variable: 'AWS_SECRET_KEY_VALUE',
            context_id: '00a9f111-55f6-46b9-8b85-57845802075d', // eslint-disable-line camelcase
            created_at: '2020-10-14T09:16:29.036Z', // eslint-disable-line camelcase
          },
          {
            variable: 'AWS_ACCESS_KEY_ID',
            context_id: '00a9f111-55f6-46b9-8b85-57845802075d', // eslint-disable-line camelcase
            created_at: '2020-10-14T09:17:45.036Z', // eslint-disable-line camelcase
          }],
        }},
    ])

    return expect(getContextsWithEnvVars('71362723', new Set(['context-one']))(fetcher)).to.eventually.eql([
      {name: 'context-one', environmentVariables: ['AWS_SECRET_KEY_VALUE', 'AWS_ACCESS_KEY_ID']},
    ])
  })

  it('does not return contexts which have not been requested', () => {
    const fetcher = mockFetcher([
      {
        requestParams: {path: 'context', params: {'owner-id': '71362723'}},
        response: {
          next_page_token: null, // eslint-disable-line camelcase
          items: [{
            name: 'context-one',
            id: '00a9f111-55f6-46b9-8b85-57845802075d',
            created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
          }, {
            name: 'context-two',
            id: '222db7a8-f9e9-41d7-a1a9-e3ba1b4e0cd5',
            created_at: '2021-09-02T14:42:20.126Z', // eslint-disable-line camelcase
          }],
        }},
      {
        requestParams: {path: 'context/00a9f111-55f6-46b9-8b85-57845802075d/environment-variable', params: {}},
        response: {
          next_page_token: null, // eslint-disable-line camelcase
          items: [],
        }},
    ])

    return expect(getContextsWithEnvVars('71362723', new Set(['context-one']))(fetcher)).to.eventually.eql([
      {name: 'context-one', environmentVariables: []},
    ])
  })
})
