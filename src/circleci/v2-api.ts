import {SchemaValidator, SchemaValidatorError} from '../schema-validator'
import fetch from 'node-fetch'
import {ApiRequestError, BadApiResponseDataError} from './types'
import {APIFetcher, APIRequest} from './request'

export const createRequest: <Response>(path: string, validate: SchemaValidator<Response>) => APIRequest<Response> =
  (path, validate) =>
    async (fetcher: APIFetcher) => validateResponse(validate, await fetcher(path))

export const createFetcher: (_: string) => APIFetcher =
  personalAccessToken =>
    path => request(personalAccessToken, path)

async function request(personalAccessToken: string, path: string): Promise<any> {
  const response = await fetch(`https://circleci.com/api/v2/${path}`, {
    headers: {
      'Circle-Token': personalAccessToken,
    },
  })

  if (response.status !== 200) {
    throw new ApiRequestError(`Failed to make request to CircleCI API: [${response.status}] ${await response.text()}`)
  }

  return response.json()
}

function validateResponse<Response>(validate: SchemaValidator<Response>, body: any): Response {
  try {
    return validate(body)
  } catch (error) {
    if (!(error instanceof SchemaValidatorError)) {
      throw error
    }

    throw new BadApiResponseDataError(error.toString())
  }
}
