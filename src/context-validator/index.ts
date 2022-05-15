import {APIRequest} from '../circleci'
import {Config} from '../config/config'
import {ContextValidatorResult} from './result'
import validate from './validate'
import {getContextsWithEnvVars} from './request'

export * from './result'

export const validateContexts: (_: Config) => APIRequest<ContextValidatorResult[]> =
  config =>
    getContextsWithEnvVars(config).map(contexts => validate(config, contexts))

