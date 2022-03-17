export type APIFetcher = (path: string) => Promise<any>

type APIRequestFunc<Response> = (fetcher: APIFetcher) => Promise<Response>

export interface APIRequest<Response> {
  (fetcher: APIFetcher): Promise<Response>
  map<NewResponse>(f: (x: Response) => NewResponse): APIRequest<NewResponse>
  flatMap<NewResponse>(f: (a: Response) => APIRequest<NewResponse>): APIRequest<NewResponse>
}

export function newAPIRequest<Response>(action: APIRequestFunc<Response>): APIRequest<Response> {
  const result = action

  return Object.assign(result, {
    flatMap<NewResponse>(f: (a: Response) => APIRequest<NewResponse>): APIRequest<NewResponse> {
      return newAPIRequest(flatMapRequest(f, result))
    },
    map<NewResponse>(f: (x: Response) => NewResponse): APIRequest<NewResponse> {
      return newAPIRequest(mapRequest(f, result))
    },
  }) as APIRequest<Response>
}

const mapRequest: <A, B>(f: (x: A) => B, request: APIRequestFunc<A>) => APIRequestFunc<B> =
  (f, request) =>
    fetcher => request(fetcher).then(x => f(x))

const flatMapRequest: <A, B>(f: (a: A) => APIRequestFunc<B>, request: APIRequestFunc<A>) => APIRequestFunc<B> =
  (f, request) =>
    async (fetcher: APIFetcher) =>
      f(await request(fetcher))(fetcher)

export const sequenceRequest: <T>(results: APIRequest<T>[]) => APIRequest<T[]> =
  results =>
    newAPIRequest(async (fetcher: APIFetcher) =>
      Promise.all(results.map(result => result(fetcher))))

export const constantResponseRequest: <Response>(_: Response) => APIRequest<Response> =
  response =>
    newAPIRequest(async (_fetcher: APIFetcher) => response)
