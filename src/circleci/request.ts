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
        return create(flatMap(f, action))
      },
      map<NewResponse>(f: (x: Response) => NewResponse): APIRequest<NewResponse> {
        return create(map(f, action))
      },
    })
}

export const sequenceRequest: <T>(results: APIRequest<T>[]) => APIRequest<T[]> =
  results =>
    APIRequest.create(async (fetcher: APIFetcher) =>
      Promise.all(results.map(result => result(fetcher))))

export const constantResponseRequest: <Response>(_: Response) => APIRequest<Response> =
  response =>
    APIRequest.create(async (_fetcher: APIFetcher) => response)

const map: <A, B>(f: (x: A) => B, request: APIRequestFunc<A>) => APIRequestFunc<B> =
  (f, request) =>
    fetcher => request(fetcher).then(x => f(x))

const flatMap: <A, B>(f: (a: A) => APIRequestFunc<B>, request: APIRequestFunc<A>) => APIRequestFunc<B> =
  (f, request) =>
    async (fetcher: APIFetcher) =>
      f(await request(fetcher))(fetcher)
