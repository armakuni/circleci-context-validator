import {APIRequest} from '../circleci'
import {Config} from '../config/config'
import {ContextValidatorResult} from './types'
import validate from './validate'
import {getContextsWithEnvVars} from './request'

export const validateContexts: (_: Config) => APIRequest<ContextValidatorResult[]> =
  config =>
    getContextsWithEnvVars(config).map(contexts => validate(config, contexts))

