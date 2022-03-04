import {expect, test} from '@oclif/test'
import {createTempYamlFile, tempFilePath} from '../../helpers/test-files'
import {setEnvVar, unsetEnvVar} from '../../helpers/environment'

describe('circleci validate', () => {
  test
  .do(setEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN', 'pat123'))
  .do(
    createTempYamlFile('valid_config.yml', {
      owner: {
        id: '***REMOVED***',
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
    }),
  )
  .nock('https://circleci.com', api => api
  .get('/api/v2/context')
  .query({'owner-id': '***REMOVED***'})
  .matchHeader('circle-token', 'pat123')
  .reply(200,
    {
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
  ),
  )
  .stdout()
  .command(['circleci validate', '--context-definitions', tempFilePath('valid_config.yml')])
  .it('runs the circleci validate successfully', ctx => {
    expect(ctx.stdout).to.contain('context-one')
    expect(ctx.stdout).to.not.contain('context-two')
    expect(ctx.stdout).to.contain('Success')
  })

  test
  .do(setEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN', 'pat123'))
  .do(
    createTempYamlFile('valid_config.yml', {
      owner: {
        id: '***REMOVED***',
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
        {
          name: 'context-two',
          purpose: 'Used for ec2 staging environment',
          'environment-variables': {
            AWS_SECRET_KEY_VALUE: {
              state: 'required',
              purpose: 'Required for AWS API usage on CLI Tool',
              labels: ['tooling', 'aws'],
            },
          },
        },
      ],
    }),
  )
  .nock('https://circleci.com', api => api
  .get('/api/v2/context')
  .query({'owner-id': '***REMOVED***'})
  .matchHeader('circle-token', 'pat123')
  .reply(200,
    {
      next_page_token: 'next-page-token', // eslint-disable-line camelcase
      items: [{
        name: 'context-two',
        id: '222db7a8-f9e9-41d7-a1a9-e3ba1b4e0cd5',
        created_at: '2021-09-02T14:42:20.126Z', // eslint-disable-line camelcase
      }],
    },
  ),
  )
  .stdout()
  .command(['circleci validate', '--context-definitions', tempFilePath('valid_config.yml')])
  .it('errors when the validation checks fail', ctx => {
    expect(ctx.stdout).to.contain('Context "context-one" is missing')
    expect(ctx.stdout).to.not.contain('Context "context-two" is missing')
  })

  test
  .do(setEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN', 'pat123'))
  .do(createTempYamlFile('invalid_config.yml', {
    owner: {
      id: '***REMOVED***',
    },
  }))
  .command(['circleci validate', '--context-definitions', tempFilePath('invalid_config.yml')])
  .catch(error => {
    expect(error.toString()).to.contain("must have required property 'contexts'")
  })
  .it('errors when config is invalid')

  test
  .do(unsetEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN'))
  .command(['circleci validate', '--context-definitions', tempFilePath('any_config.yml')])
  .catch(error => {
    expect(error.toString()).to.contain('CIRCLECI_PERSONAL_ACCESS_TOKEN environment variable is not set')
  })
  .it('errors when access token env var is missing')

  test
  .do(setEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN', 'pat123'))
  .do(
    createTempYamlFile('valid_config.yml', {
      owner: {
        id: '***REMOVED***',
      },

      contexts: [
        {
          name: 'legacy-production',
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
    }),
  )
  .nock('https://circleci.com', api => api
  .get('/api/v2/context')
  .query({'owner-id': '***REMOVED***'})
  .matchHeader('circle-token', 'pat123')
  .reply(500, {}),
  )
  .command(['circleci validate', '--context-definitions', tempFilePath('valid_config.yml')])
  .catch(error => {
    expect(error.toString()).to.contain('CircleCI API request failed')
  })
  .it('errors when access CircleCI API request fails')

  test
  .do(setEnvVar('CIRCLECI_PERSONAL_ACCESS_TOKEN', 'pat123'))
  .do(
    createTempYamlFile('valid_config.yml', {
      owner: {
        id: '***REMOVED***',
      },

      contexts: [
        {
          name: 'legacy-production',
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
    }),
  )
  .nock('https://circleci.com', api => api
  .get('/api/v2/context')
  .query({'owner-id': '***REMOVED***'})
  .matchHeader('circle-token', 'pat123')
  .reply(200, {}),
  )
  .command(['circleci validate', '--context-definitions', tempFilePath('valid_config.yml')])
  .catch(error => {
    expect(error.toString()).to.contain('CircleCI API request failed')
  })
  .it('errors when access CircleCI API request returns bad data')
})
