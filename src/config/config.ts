/**
 *  Example YAML data shape to interface holding this data
 *
 *  AWS_SECRET_KEY_VALUE: # The key name only, do not provide the value
 *      state: required # required or optional
 *      purpose: Required for AWS API usage on CLI Tool # reason for it's purpose
 *      labels:  # list of potential ways to group these together
 *          - tooling
 *          - aws
 */

export interface Config {
  owner: Owner
  contexts: ExpectedContext[]
}

export interface Owner {
  id: string
}

export interface ExpectedContext {
  name: string
  purpose: string
  'environment-variables': EnvVarBlock
}

/**
 * Container interface for the environment variable name and it's corresponding metadata values
 */
interface EnvVarBlock {
    [keyName: string] : ExpectedEnvironmentVariable
}

/**
 * The metadata values of the environment variable key
 */
export interface ExpectedEnvironmentVariable {
    state: string
    purpose: string
    labels: string[]
}
