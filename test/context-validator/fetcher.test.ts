import {expect} from 'chai'
import {getContextsWithEnvVars} from '../../src/context-validator/request'
import {Config} from '../../src/config/config'
import {mockFetcher} from '../helpers/mock-api'

describe('context-validator', () => {
  describe('validate', () => {
    it('perform a successful validation', () => {
      const config: Config = {
        owner: {
          id: '71362723',
        },
        contexts: [
          {
            name: 'context-one',
            purpose: 'Used for ec2 production environment',
            'environment-variables': {},
          },
        ],
      }

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

      return expect(getContextsWithEnvVars(config)(fetcher)).to.eventually.eql([
        {name: 'context-one', environmentVariables: []},
      ])
    })

    it('perform a unsuccessful validation when a environment variable is missing', () => {
      const config: Config = {
        owner: {
          id: '71362723',
        },
        contexts: [
          {
            name: 'context-one',
            purpose: 'Used for ec2 production environment',
            'environment-variables': {
              AWS_SECRET_KEY_VALUE: {
                state: 'required',
                purpose: 'Required for AWS API usage on CLI Tool',
                labels: ['tooling', 'aws'],
              },
            },
          },
        ],
      }

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
            items: [],
          }},
      ])

      return expect(getContextsWithEnvVars(config)(fetcher)).to.eventually.eql([
        {name: 'context-one', environmentVariables: []},
      ])
    })

    it('perform a unsuccessful validation due to missing context in circle', () => {
      const config: Config = {
        owner: {
          id: '71362723',
        },
        contexts: [
          {
            name: 'context-one',
            purpose: 'Used for ec2 production environment',
            'environment-variables': {
              AWS_SECRET_KEY_VALUE: {
                state: 'required',
                purpose: 'Required for AWS API usage on CLI Tool',
                labels: ['tooling', 'aws'],
              },
            },
          },
        ],
      }

      const fetcher = mockFetcher([
        {
          requestParams: {path: 'context', params: {'owner-id': '71362723'}},
          response: {
            next_page_token: null, // eslint-disable-line camelcase
            items: [],
          }},
      ])

      return expect(getContextsWithEnvVars(config)(fetcher)).to.eventually.eql([])
    })

    it('perform a successful validation, but contains optional env var', () => {
      const config: Config = {
        owner: {
          id: '71362723',
        },
        contexts: [
          {
            name: 'context-one',
            purpose: 'Used for ec2 production environment',
            'environment-variables': {
              AWS_SECRET_KEY_VALUE: {
                state: 'optional',
                purpose: 'optional for AWS API usage on CLI Tool',
                labels: ['tooling', 'aws'],
              },
              AWS_ACCESS_KEY_ID: {
                state: 'optional',
                purpose: 'optional for AWS API usage on CLI Tool',
                labels: ['tooling', 'aws'],
              },
            },
          },
        ],
      }

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
            }],
          }},
      ])

      return expect(getContextsWithEnvVars(config)(fetcher)).to.eventually.eql([
        {name: 'context-one', environmentVariables: ['AWS_SECRET_KEY_VALUE']},
      ])
    })

    it('perform a unsuccessful validation, api returns additional env var value not configured', () => {
      const config: Config = {
        owner: {
          id: '71362723',
        },
        contexts: [
          {
            name: 'context-one',
            purpose: 'Used for ec2 production environment',
            'environment-variables': {
              AWS_SECRET_KEY_VALUE: {
                state: 'required',
                purpose: 'optional for AWS API usage on CLI Tool',
                labels: ['tooling', 'aws'],
              },
            },
          },
        ],
      }

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

      return expect(getContextsWithEnvVars(config)(fetcher)).to.eventually.eql([
        {name: 'context-one', environmentVariables: ['AWS_SECRET_KEY_VALUE', 'AWS_ACCESS_KEY_ID']},
      ])
    })
  })
})

