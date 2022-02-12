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
  contexts: Context[]
}

export interface Owner {
  id: string
}

export interface Context {
  name: string
  purpose: string
  'environment-variables': EnvVarEntry
}

/**
 * Container interface for the environment variable name and it's corresponding metadata values
 */
export interface EnvVarEntry {
    [keyName: string] : EnvVarContents
}

/**
 * The metadata values of the environment variable key
 */
export interface EnvVarContents {
    state: EnvVarState
    purpose: string
    labels: string[]
}

/**
 * Enum to control the lifecycle state of an environment variable
 */
export enum EnvVarState {
    active, optional, deprecated
}
