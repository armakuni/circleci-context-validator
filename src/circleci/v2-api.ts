import {Validator, ValidatorError} from '../validator'
import fetch from 'node-fetch'
import {ApiRequestError, BadApiResponseDataError} from './types'

export type V2APIRequester<Response> = (personalAccessToken: string) => Promise<Response>

export function v2ApiFetcher<Response>(path: string, validate: Validator<Response>): V2APIRequester<Response> {
  return async (personalAccessToken: string) => {
    return validateResponse(validate, await request(path, personalAccessToken))
  }
}

async function request(path: string, personalAccessToken: string) {
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

function validateResponse<Response>(validate: Validator<Response>, body: any): Response {
  try {
    return validate(body)
  } catch (error) {
    if (!(error instanceof ValidatorError)) {
      throw error
    }

    throw new BadApiResponseDataError(error.toString())
  }
}
