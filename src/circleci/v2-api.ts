import {SchemaValidator, SchemaValidatorError} from '../schema-validator'
import fetch from 'node-fetch'
import {ApiRequestError, BadApiResponseDataError} from './types'
import {APIRequest} from './api-request'
import {APIFetcher, RequestParams} from './api-fetcher'

export const createFetcher: (_: string) => APIFetcher =
  personalAccessToken => requestParams =>
    request(personalAccessToken, requestParams)

export const createRequest: <Response>(rp: RequestParams, v: SchemaValidator<Response>) => APIRequest<Response> =
  (requestParams, validate) =>
    APIRequest.create(async (fetcher: APIFetcher) => validateResponse(validate, await fetcher(requestParams)))

async function request(personalAccessToken: string, requestParams: RequestParams): Promise<any> {
  const query = Object.entries(requestParams.params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')

  const url = `https://circleci.com/api/v2/${requestParams.path}${query ? '?' + query : ''}`

  const response = await fetch(url, {
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
