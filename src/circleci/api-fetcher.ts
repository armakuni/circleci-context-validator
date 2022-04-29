export interface RequestParams {
  path: string
  params: { [key: string]: string }
}

export namespace RequestParams {
  export function equal(requestParam1: RequestParams, requestParam2: RequestParams): boolean {
    return JSON.stringify(requestParam1) === JSON.stringify(requestParam2)
  }
}

export type APIFetcher = (requestParams: RequestParams) => Promise<any>
