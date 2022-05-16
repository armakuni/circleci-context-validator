import {Config} from '../../src/config/config'
import {expect} from 'chai'
import {
  ContextEnvVarMissingResult,
  ContextEnvVarUnexpectedResult,
  ContextMissingResult,
  ContextValidatedResult,

} from '../../src/context-validator'
import validate from '../../src/context-validator/validate'
import {FetchedContext} from '../../src/circleci/get-contexts-with-environment-variables'

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

    const fetchedContexts = [
      {name: 'context-one', environmentVariables: []},
    ]

    return expect(validate(config, fetchedContexts)).to.eql([new ContextValidatedResult('context-one')])
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

    const fetchedContexts = [
      {name: 'context-one', environmentVariables: []},
    ]

    return expect(validate(config, fetchedContexts)).to.eql([
      new ContextEnvVarMissingResult('context-one', 'AWS_SECRET_KEY_VALUE'),
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

    const fetchedContexts: FetchedContext[] = []

    return expect(validate(config, fetchedContexts)).to.eql([
      new ContextMissingResult('context-one'),
    ])
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

    const fetchedContexts = [
      {name: 'context-one', environmentVariables: ['AWS_SECRET_KEY_VALUE']},
    ]

    return expect(validate(config, fetchedContexts)).to.eql([
      new ContextValidatedResult('context-one'),
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

    const fetchedContexts = [
      {name: 'context-one', environmentVariables: ['AWS_SECRET_KEY_VALUE', 'AWS_ACCESS_KEY_ID']},
    ]

    return expect(validate(config, fetchedContexts)).to.eql([
      new ContextEnvVarUnexpectedResult('context-one', 'AWS_ACCESS_KEY_ID'),
    ])
  })
})
