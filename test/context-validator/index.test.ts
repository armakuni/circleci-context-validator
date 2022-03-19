import {expect} from 'chai'
import {validateContexts} from '../../src/context-validator'
import {Config} from '../../src/config/config'
import {
  ContextFailedToValidateResult,
  ContextMissingResult,
  ContextSuccessfullyValidatedResult,
  MissingEnvVarError,
} from '../../src/context-validator/types'
import {
  APIFetcher,
  APIRequest,
  ApiRequestError,
  constantResponseRequest,
  FetchedContext,
  GetContextEnvironmentVariables,
  GetContexts,
} from '../../src/circleci'
import {FetchedEnvVar} from '../../src/circleci/get-context-environment-variables'

const mockAPIRequest: <Input, Response>(error: (_: Input) => string) => (responses: { key: Input, response: Response }) => (_: Input) => APIRequest<Response> =
  errorMessage => (...responses) => {
    const responseMap = new Map(Object.values(responses).map(({key, response}) => [key, response]))

    return input => {
      const response = responseMap.get(input)
      if (response === undefined) {
        throw new ApiRequestError(errorMessage(input))
      }

      return constantResponseRequest(response)
    }
  }

const mockGetContexts: (...responses: { key: string, response: FetchedContext[] }[]) => GetContexts =
  mockAPIRequest(ownerId => `No mocked getContexts request for owner ID ${ownerId}`)

const mockGetContextsEnvironmentVariables: (...responses: { key: string, response: FetchedEnvVar[] }[]) => GetContextEnvironmentVariables =
  mockAPIRequest(contextId => `No mocked getContextEnvironmentVariables request for context ID ${contextId}`)

const fetcher: APIFetcher = _ => {
  throw new Error('will not get called')
}

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

      const getContexts = mockGetContexts(
        {
          key: config.owner.id,
          response: [
            {
              name: 'context-one',
              id: '00a9f111-55f6-46b9-8b85-57845802075d',
            }, {
              name: 'context-two',
              id: '222db7a8-f9e9-41d7-a1a9-e3ba1b4e0cd5',
            },
          ],
        },
      )

      const getContextEnvironmentVariables = mockGetContextsEnvironmentVariables({
        key: '00a9f111-55f6-46b9-8b85-57845802075d',
        response: [],
      })

      return expect(validateContexts(config, getContexts, getContextEnvironmentVariables)(fetcher))
      .to.eventually.eql([new ContextSuccessfullyValidatedResult('context-one')])
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

      const getContexts = mockGetContexts({
        key: config.owner.id,
        response: [
          {
            name: 'context-one',
            id: '00a9f111-55f6-46b9-8b85-57845802075d',
          },
        ],
      })

      const getContextEnvironmentVariables = mockGetContextsEnvironmentVariables({
        key: '00a9f111-55f6-46b9-8b85-57845802075d',
        response: [],
      })

      return expect(validateContexts(config, getContexts, getContextEnvironmentVariables)(fetcher))
      .to.eventually.eql([
        new ContextFailedToValidateResult(
          'context-one',
          [new MissingEnvVarError('AWS_SECRET_KEY_VALUE')],
        ),
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

      const getContexts = mockGetContexts({
        key: config.owner.id,
        response: [],
      })

      const getContextEnvironmentVariables = mockGetContextsEnvironmentVariables()

      return expect(validateContexts(config, getContexts, getContextEnvironmentVariables)(fetcher))
      .to.eventually.eql([new ContextMissingResult('context-one')])
    })
  })
})

