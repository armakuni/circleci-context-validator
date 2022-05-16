import {APIRequest} from '../circleci'
import {Config} from '../config/config'
import {ContextValidatorResult} from './result'
import validate from './validate'
import {getContextsWithEnvironmentVariables} from '../circleci'

export * from './result'

export const validateContexts: (_: Config) => APIRequest<ContextValidatorResult[]> =
  config =>
    getContextsWithEnvironmentVariables(config.owner.id, new Set(config.contexts.map(context => context.name)))
    .map(contexts => validate(config, contexts))
