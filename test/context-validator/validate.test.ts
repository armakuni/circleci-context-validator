import {expect} from 'chai'
import {validateContexts} from '../../src/context-validator'
import {Config} from '../../src/config/config'
import {Environment} from '../../src/lib/environment'
import * as nock from 'nock'
import {ContextMissingResult, ContextValidatedResult} from '../../src/context-validator/types'

describe('context-validator', () => {
  describe('validate', () => {
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

    const environment: Environment = {
      CIRCLECI_PERSONAL_ACCESS_TOKEN: 'some-token',
    }

    it('perform a successful validation', () => {
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
        }, {
          name: 'context-two',
          id: '222db7a8-f9e9-41d7-a1a9-e3ba1b4e0cd5',
          created_at: '2021-09-02T14:42:20.126Z', // eslint-disable-line camelcase
        }],
      })

      return expect(validateContexts(config, environment)).to.eventually.eql([new ContextValidatedResult('context-one')])
    })

    it('perform a unsuccessful validation due to missing context in circle', () => {
      nock('https://circleci.com')
      .get('/api/v2/context')
      .query({'owner-id': config.owner.id})
      .matchHeader('circle-token', environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)
      .reply(200, {
        next_page_token: 'next-page-token', // eslint-disable-line camelcase
        items: [],
      })

      return expect(validateContexts(config, environment)).to.eventually.eql([new ContextMissingResult('context-one')])
    })
  })
})

