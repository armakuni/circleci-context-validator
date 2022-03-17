export type APIRequest<Response> = (fetcher: APIFetcher) => Promise<Response>

export type APIFetcher = (path: string) => Promise<any>

export const mapRequest: <A, B>(f: (x: A) => B, request: APIRequest<A>) => APIRequest<B> =
  (f, request) =>
    fetcher => request(fetcher).then(x => f(x))

export const chainRequest: <A, B>(f: (a: A) => APIRequest<B>, request: APIRequest<A>) => APIRequest<B> =
  (f, request) =>
    async (fetcher: APIFetcher) =>
      f(await request(fetcher))(fetcher)

export const sequenceRequest: <T>(results: APIRequest<T>[]) => APIRequest<T[]> =
  results =>
    async (fetcher: APIFetcher) =>
      Promise.all(results.map(result => result(fetcher)))

export const constantResponseRequest: <Response>(_: Response) => APIRequest<Response> =
  response =>
    async (_fetcher: APIFetcher) =>
      response
