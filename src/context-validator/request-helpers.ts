import {APIRequest, sequenceRequest} from '../circleci'

export function createRequestsWithDefault<Item, Response>(
  predicate: (_: Item) => boolean,
  createExistingRequest: (_: Item) => APIRequest<Response>,
  createDefaultRequest: (_: Item) => APIRequest<Response>,
  items: Item[],
): APIRequest<Response>[] {
  const missing = items.filter(item => !predicate(item)).map(item => createDefaultRequest(item))
  const existing = items.filter(item => predicate(item)).map(item => createExistingRequest(item))

  return [...missing, ...existing]
}

export const combineResults: <T>(_: APIRequest<T[]>[]) => APIRequest<T[]> =
  <T>(results: APIRequest<T[]>[]) =>
    sequenceRequest(results).map((results: T[][]) => results.flat())
