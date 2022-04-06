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
  mapFetcher(f: (x: APIFetcher) => APIFetcher): APIRequest<Response>
}

const mapRequest: <A, B>(f: (_: A) => B, _: APIRequestFunc<A>) => APIRequestFunc<B> =
  (f, request) => fetcher => request(fetcher).then(x => f(x))

const flatMapRequest: <A, B>(f: (x: A) => APIRequestFunc<B>, _: APIRequestFunc<A>) => APIRequestFunc<B> =
  (f, request) => async fetcher => f(await request(fetcher))(fetcher)

export namespace APIRequest {
  export const create: <Response>(action: APIRequestFunc<Response>) => APIRequest<Response> =
    <Response>(action: APIRequestFunc<Response>) => Object.assign(action, {
      flatMap<NewResponse>(f: (a: Response) => APIRequest<NewResponse>): APIRequest<NewResponse> {
        return create(flatMapRequest(f, action))
      },
      map<NewResponse>(f: (x: Response) => NewResponse): APIRequest<NewResponse> {
        return create(mapRequest(f, action))
      },
      mapFetcher(f: (x: APIFetcher) => APIFetcher): APIRequest<Response> {
        return create((fetcher: APIFetcher) => action(f(fetcher)))
      },
    })
}

export const createRequest: <Response>(rp: RequestParams, v: SchemaValidator<Response>) => APIRequest<Response> =
  (requestParams, validate) =>
    APIRequest.create(async (fetcher: APIFetcher) => validateResponse(validate, await fetcher(requestParams)))

export const createFetcher: (_: string) => APIFetcher =
  personalAccessToken => requestParams =>
    request(personalAccessToken, requestParams)

export const constantResponseRequest: <Response>(_: Response) => APIRequest<Response> =
  response =>
    APIRequest.create(async _fetcher => response)

export const sequenceRequest: <A>(_: APIRequest<A>[]) => APIRequest<A[]> =
  requests =>
    APIRequest.create(async fetcher => Promise.all(requests.map(request => request(fetcher))))

async function request(personalAccessToken: string, requestParams: RequestParams): Promise<any> {
  const query = Object.entries(requestParams.params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')

  const url = `https://circleci.com/api/v2/${requestParams.path}${query ? '?' + query : ''}`
  console.log('request', url, JSON.stringify(requestParams))

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
