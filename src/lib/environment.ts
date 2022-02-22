export const ACCESS_TOKEN_ENV_VAR_NAME = 'CIRCLECI_PERSONAL_ACCESS_TOKEN'

export interface Environment {
  CIRCLECI_PERSONAL_ACCESS_TOKEN: string
}

export function loadEnvironment(): Environment {
  const personalAccessToken = process.env[ACCESS_TOKEN_ENV_VAR_NAME]

  if (personalAccessToken === undefined ||
    personalAccessToken === '') {
    throw new Error(`${ACCESS_TOKEN_ENV_VAR_NAME} environment variable is not set`)
  }

  return {CIRCLECI_PERSONAL_ACCESS_TOKEN: personalAccessToken}
}
