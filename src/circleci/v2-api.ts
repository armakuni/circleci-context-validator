import {Validator, ValidatorError} from '../schema-validator'
import fetch from 'node-fetch'
import {ApiRequestError, BadApiResponseDataError} from './types'

export type APIRequest<Response> = (fetcher: APIFetcher) => Promise<Response>

export type APIFetcher = (path: string) => Promise<any>

export function createRequest<Response>(path: string, validate: Validator<Response>): APIRequest<Response> {
  return async (fetcher: APIFetcher) => validateResponse(validate, await fetcher(path))
}

export function createFetcher(personalAccessToken: string): APIFetcher {
  return (path: string) => request(personalAccessToken, path)
}

export function mapRequest<A, B>(f: (x: A) => B, request: APIRequest<A>): APIRequest<B> {
  return (fetcher: APIFetcher): Promise<B> => request(fetcher).then((x: A) => f(x))
}

export function flatMapRequest<A, B>(f: (x: A) => APIRequest<B>, request: APIRequest<A>): APIRequest<B> {
  return async (fetcher: APIFetcher): Promise<B> => f(await request(fetcher))(fetcher)
}

export function sequenceRequest<A>(requests: APIRequest<A>[]): APIRequest<A[]> {
  return async (fetcher: APIFetcher): Promise<A[]> => Promise.all(requests.map(request => request(fetcher)))
}

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
