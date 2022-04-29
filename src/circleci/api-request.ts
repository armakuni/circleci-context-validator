import {APIFetcher} from './api-fetcher'

type APIRequestFunc<Response> = (fetcher: APIFetcher) => Promise<Response>

export interface APIRequest<Response> extends APIRequestFunc<Response> {
  map<NewResponse>(f: (x: Response) => NewResponse): APIRequest<NewResponse>

  flatMap<NewResponse>(f: (a: Response) => APIRequest<NewResponse>): APIRequest<NewResponse>

  mapFetcher(f: (x: APIFetcher) => APIFetcher): APIRequest<Response>
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
      mapFetcher(f: (x: APIFetcher) => APIFetcher): APIRequest<Response> {
        return create((fetcher: APIFetcher) => action(f(fetcher)))
      },
    })
}
export const sequenceRequest: <A>(_: APIRequest<A>[]) => APIRequest<A[]> =
  requests =>
    APIRequest.create(async fetcher => Promise.all(requests.map(request => request(fetcher))))

export const constantResponseRequest: <Response>(_: Response) => APIRequest<Response> =
  response =>
    APIRequest.create(async _fetcher => response)

const mapRequest: <A, B>(f: (_: A) => B, _: APIRequestFunc<A>) => APIRequestFunc<B> =
  (f, request) => fetcher => request(fetcher).then(x => f(x))

const flatMapRequest: <A, B>(f: (x: A) => APIRequestFunc<B>, _: APIRequestFunc<A>) => APIRequestFunc<B> =
  (f, request) => async fetcher => f(await request(fetcher))(fetcher)
