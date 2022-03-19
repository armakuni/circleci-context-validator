import {APIRequest, sequenceRequest} from '../circleci'

export const createWithDefault:
  <Item, Result>(
    predicate: (_: Item) => boolean,
    createExistingRequest: (_: Item) => Result,
    createDefaultRequest: (_: Item) => Result,
    items: Item,
  ) => Result =
  (predicate, createExistingRequest, createDefaultRequest, item) =>
    predicate(item) ? createExistingRequest(item) : createDefaultRequest(item)

export const combineResults: <T>(_: APIRequest<T[]>[]) => APIRequest<T[]> =
  <T>(results: APIRequest<T[]>[]) =>
    sequenceRequest(results).map((results: T[][]) => results.flat())
