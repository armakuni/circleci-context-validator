import {GetContextsResponse} from '../../src/circleci'
import {GetContextEnvironmentVariablesResponse} from '../../src/circleci/get-context-environment-variables'

export const getContextsResponse: (contexts: {name: string, id: string}[]) => GetContextsResponse =
  contexts => ({
    next_page_token: null, // eslint-disable-line camelcase
    items: contexts.map(({name, id}) => ({
      name,
      id,
      created_at: '2020-10-14T09:02:53.453Z', // eslint-disable-line camelcase
    })),
  })

export const getContextEnvVarsResponse: (contextId: string, envVars: string[]) => GetContextEnvironmentVariablesResponse =
  (contextId, envVars) => ({
    next_page_token: null, // eslint-disable-line camelcase
    items: envVars.map(variable => ({
      variable,
      context_id: contextId, // eslint-disable-line camelcase
      created_at: '2020-10-14T09:16:29.036Z', // eslint-disable-line camelcase
    })),
  })
