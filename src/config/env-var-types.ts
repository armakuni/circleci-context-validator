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
    state: StateEnum
    purpose: string
    labels: string[]
}

/**
 * Enum to control the lifecycle state of an environment variable
 */
export enum StateEnum {
    active, optional, deprecated
}
