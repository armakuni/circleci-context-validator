import {Validator, ValidatorError} from '../schema-validator'
import fetch from 'node-fetch'
import {ApiRequestError, BadApiResponseDataError} from './types'

export type APIFetcher = (path: string) => Promise<any>

type APIRequestFunc<Response> = (fetcher: APIFetcher) => Promise<Response>

export interface APIRequest<Response> extends APIRequestFunc<Response> {
  map<NewResponse>(f: (x: Response) => NewResponse): APIRequest<NewResponse>
  flatMap<NewResponse>(f: (a: Response) => APIRequest<NewResponse>): APIRequest<NewResponse>
}

export namespace APIRequest {
  export const create: <Response>(action: APIRequestFunc<Response>) => APIRequest<Response> =
    <Response>(action: APIRequestFunc<Response>) => Object.assign(action, {
      flatMap<NewResponse>(f: (a: Response) => APIRequest<NewResponse>): APIRequest<NewResponse> {
        return create(flatMapRequest(f, action))
      },
      map<NewResponse>(f: (x: Response) => NewResponse): APIRequest<NewResponse> {
        return create(mapRequest(f, action))
      },
    })
}

export function createRequest<Response>(path: string, validate: Validator<Response>): APIRequest<Response> {
  return APIRequest.create(async (fetcher: APIFetcher) => validateResponse(validate, await fetcher(path)))
}

export function createFetcher(personalAccessToken: string): APIFetcher {
  return (path: string) => request(personalAccessToken, path)
}

export const constantResponseRequest: <Response>(_: Response) => APIRequest<Response> =
  response =>
    APIRequest.create(async (_fetcher: APIFetcher) => response)

export function mapRequest<A, B>(f: (x: A) => B, request: APIRequestFunc<A>): APIRequestFunc<B> {
  return (fetcher: APIFetcher): Promise<B> => request(fetcher).then((x: A) => f(x))
}

export function flatMapRequest<A, B>(f: (x: A) => APIRequestFunc<B>, request: APIRequestFunc<A>): APIRequestFunc<B> {
  return async (fetcher: APIFetcher): Promise<B> => f(await request(fetcher))(fetcher)
}

export function sequenceRequest<A>(requests: APIRequest<A>[]): APIRequest<A[]> {
  return APIRequest.create(async (fetcher: APIFetcher): Promise<A[]> => Promise.all(requests.map(request => request(fetcher))))
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
