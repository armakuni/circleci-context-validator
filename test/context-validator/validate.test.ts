import {expect} from 'chai'
import {validateContexts} from '../../src/context-validator'
import {Config} from '../../src/config/config'
import {Environment} from '../../src/lib/environment'
import * as nock from 'nock'
import {ContextEnvVarMissingResult, ContextEnvVarUnexpectedResult, ContextMissingResult, ContextValidatedResult} from '../../src/context-validator/types'
import {APIFetcher, ApiRequestError, createFetcher} from '../../src/circleci'

const newFetcher = (responses: any): APIFetcher => {
  const mappedResponses = new Map(Object.entries(responses))
  return (path: string) => {
    if (mappedResponses.has(path)) {
      return Promise.resolve(mappedResponses.get(path))
    }

    throw new ApiRequestError('failed to find response with path')
  }
}

describe('context-validator', () => {
  describe('validate', () => {
    const environment: Environment = {
      CIRCLECI_PERSONAL_ACCESS_TOKEN: 'some-token',
    }

    const fetcher = createFetcher('some-token')

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

      const fetcher = newFetcher({
        'context?owner-id=71362723': {
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
        },
        'context/00a9f111-55f6-46b9-8b85-57845802075d/environment-variable': {
          next_page_token: 'next-page-token', // eslint-disable-line camelcase
          items: [],
        },
      })

      return expect(validateContexts(config)(fetcher)).to.eventually.eql([new ContextValidatedResult('context-one')])
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

      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': config.owner.id})
      .matchHeader('circle-token', environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)
      .reply(200, {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [{
          name: 'context-one',
          id: '00a9f111-55f6-46b9-8b85-57845802075d',
          created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
        }],
      })
      nock('https://circleci.com')
      .get('/api/v2/context/00a9f111-55f6-46b9-8b85-57845802075d/environment-variable')
      .matchHeader('circle-token', environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)
      .reply(200, {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [],
      })

      return expect(validateContexts(config)(fetcher)).to.eventually.eql([new ContextEnvVarMissingResult('context-one', 'AWS_SECRET_KEY_VALUE')])
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

      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': config.owner.id})
      .matchHeader('circle-token', environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)
      .reply(200, {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [],
      })

      return expect(validateContexts(config)(fetcher)).to.eventually.eql([new ContextMissingResult('context-one')])
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

      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': config.owner.id})
      .matchHeader('circle-token', environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)
      .reply(200, {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [{
          name: 'context-one',
          id: '00a9f111-55f6-46b9-8b85-57845802075d',
          created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
        }],
      })
      nock('https://circleci.com')
      .get('/api/v2/context/00a9f111-55f6-46b9-8b85-57845802075d/environment-variable')
      .matchHeader('circle-token', environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)
      .reply(200, {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [{
          variable: 'AWS_SECRET_KEY_VALUE',
          context_id: '00a9f111-55f6-46b9-8b85-57845802075d', // eslint-disable-line camelcase
          created_at: '2020-10-14T09:16:29.036Z', // eslint-disable-line camelcase
        }],
      })

      return expect(validateContexts(config)(fetcher)).to.eventually.eql([new ContextValidatedResult('context-one')])
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

      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': config.owner.id})
      .matchHeader('circle-token', environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)
      .reply(200, {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [{
          name: 'context-one',
          id: '00a9f111-55f6-46b9-8b85-57845802075d',
          created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
        }],
      })
      nock('https://circleci.com')
      .get('/api/v2/context/00a9f111-55f6-46b9-8b85-57845802075d/environment-variable')
      .matchHeader('circle-token', environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)
      .reply(200, {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
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
      })

      return expect(validateContexts(config)(fetcher)).to.eventually.eql([new ContextEnvVarUnexpectedResult('context-one', 'AWS_ACCESS_KEY_ID')])
    })
  })
})

