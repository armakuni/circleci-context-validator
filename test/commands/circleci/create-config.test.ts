import {expect, test} from '@oclif/test'
import * as yaml from 'js-yaml'
import {setEnvVar, unsetEnvVar} from '../../helpers/environment'

describe('circleci create-config', () => {
  test
  .do(setEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN', 'pat123'))
  .nock('https://circleci.com', api => api
  .get('/api/v2/context')
  .query({'owner-id': '89137e7e-1255-4321-8888-221971005a18'})
  .matchHeader('circle-token', 'pat123')
  .reply(200,
    {
      next_page_token: null, // eslint-disable-line camelcase
      items: [{
        name: 'context-one',
        id: '00a9f111-55f6-46b9-8b85-57845802075d',
        created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
      }, {
        name: 'context-two',
        id: '222db7a8-f9e9-41d7-a1a9-e3ba1b4e0cd5',
        created_at: '2021-09-02T14:42:20.126Z', // eslint-disable-line camelcase
      }, {
        name: 'context-three',
        id: '2c5bce35-4d5a-4b5e-a65e-0ac9940b18d2',
        created_at: '2021-09-02T14:42:20.126Z', // eslint-disable-line camelcase
      }],
    },
  ),
  )
  .nock('https://circleci.com', api => api
  .get('/api/v2/context/00a9f111-55f6-46b9-8b85-57845802075d/environment-variable')
  .matchHeader('circle-token', 'pat123')
  .reply(200, {
    next_page_token: null, // eslint-disable-line camelcase
    items: [{
      variable: 'AWS_SECRET_KEY_VALUE',
      context_id: '00a9f111-55f6-46b9-8b85-57845802075d', // eslint-disable-line camelcase
      created_at: '2020-10-14T09:16:29.036Z', // eslint-disable-line camelcase
    }],
  }),
  )
  .nock('https://circleci.com', api => api
  .get('/api/v2/context/2c5bce35-4d5a-4b5e-a65e-0ac9940b18d2/environment-variable')
  .matchHeader('circle-token', 'pat123')
  .reply(200, {
    next_page_token: null, // eslint-disable-line camelcase
    items: [{
      variable: 'SECRET_VALUE',
      context_id: '2c5bce35-4d5a-4b5e-a65e-0ac9940b18d2', // eslint-disable-line camelcase
      created_at: '2020-10-14T09:16:29.036Z', // eslint-disable-line camelcase
    }],
  }),
  )
  .stdout()
  .command(['circleci create-config', '--owner-id', '89137e7e-1255-4321-8888-221971005a18', '--contexts', 'context-one,context-three'])
  .exit(0)
  .it('runs the circleci validate successfully', ctx => {
    const config = yaml.load(ctx.stdout)
    expect(config).to.eql({
      owner: {id: '89137e7e-1255-4321-8888-221971005a18'},
      contexts: [
        {
          name: 'context-one',
          purpose: '',
          'environment-variables': {
            AWS_SECRET_KEY_VALUE: {
              state: 'required',
              purpose: '',
              labels: ['imported'],
            },
          },
        },
        {
          name: 'context-three',
          purpose: '',
          'environment-variables': {
            SECRET_VALUE: {
              state: 'required',
              purpose: '',
              labels: ['imported'],
            },
          },
        },
      ],
    })
  })

  test
  .do(unsetEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN'))
  .command(['circleci create-config', '--owner-id', '26b2cade-99cf-4eb6-b982-1d190e3edf75', '--contexts', 'context-one'])
  .catch(error => {
    expect(error.toString()).to.contain('CIRCLECI_PERSONAL_ACCESS_TOKEN environment variable is not set')
  })
  .it('errors when access token env var is missing')

  test
  .do(setEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN', 'pat123'))
  .nock('https://circleci.com', api => api
  .get('/api/v2/context')
  .query({'owner-id': '89137e7e-1255-4321-8888-221971005a18'})
  .matchHeader('circle-token', 'pat123')
  .reply(500, {}),
  )
  .command(['circleci create-config', '--owner-id', '89137e7e-1255-4321-8888-221971005a18', '--contexts', 'context-name'])
  .catch(error => {
    expect(error.toString()).to.contain('CircleCI API request failed')
  })
  .it('errors when access CircleCI API request fails')

  test
  .do(setEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN', 'pat123'))
  .nock('https://circleci.com', api => api
  .get('/api/v2/context')
  .query({'owner-id': '89137e7e-1255-4321-8888-221971005a18'})
  .matchHeader('circle-token', 'pat123')
  .reply(200, {}),
  )
  .command(['circleci create-config', '--owner-id', '89137e7e-1255-4321-8888-221971005a18', '--contexts', 'context-name'])
  .catch(error => {
    expect(error.toString()).to.contain('CircleCI API request failed')
  })
  .it('errors when access CircleCI API request returns bad data')
})
