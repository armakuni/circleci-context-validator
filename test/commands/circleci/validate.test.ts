import {expect, test} from '@oclif/test'
import {createTempYamlFile, tempFilePath} from '../../helpers/test-files'

describe('circleci validate', () => {
  test
  .do(() => {
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
    },
    )
  })
  .stdout()
  .command(['circleci validate', '--context-definitions', tempFilePath('valid_config.yml')])
  .it('runs the circleci validate successfully', ctx => {
    expect(ctx.stdout).to.contain('Success')
  })

  test
  .do(() => createTempYamlFile('invalid_config.yml', {
    owner: {
      id: '***REMOVED***',
    },
  }))
  .command(['circleci validate', '--context-definitions', tempFilePath('invalid_config.yml')])
  .catch(error => {
    expect(error.toString()).to.contain("must have required property 'contexts'")
  })
  .it('runs the circleci validate command')
})
