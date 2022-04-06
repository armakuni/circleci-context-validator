import {SchemaValidator, SchemaValidatorError} from '../schema-validator'
import fetch from 'node-fetch'
import {ApiRequestError, BadApiResponseDataError} from './types'

export interface RequestParams {
  path: string
  params: {[key: string]: string}
}

export namespace RequestParams {
  export function equal(requestParam1: RequestParams, requestParam2: RequestParams): boolean {
    return JSON.stringify(requestParam1) ===  JSON.stringify(requestParam2)
  }
}

export type APIFetcher = (requestParams: RequestParams) => Promise<any>

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

export function createRequest<Response>(requestParams: RequestParams, validate: SchemaValidator<Response>): APIRequest<Response> {
  return APIRequest.create(async (fetcher: APIFetcher) => validateResponse(validate, await fetcher(requestParams)))
}

export function createFetcher(personalAccessToken: string): APIFetcher {
  return (requestParams: RequestParams) => request(personalAccessToken, requestParams)
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

async function request(personalAccessToken: string, requestParams: RequestParams): Promise<any> {
  const query = Object.entries(requestParams.params).map(([key, value]) => `${key}=${value}`).join('&')

  const response = await fetch(`https://circleci.com/api/v2/${requestParams.path}${query ? '?' + query : ''}`, {
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
