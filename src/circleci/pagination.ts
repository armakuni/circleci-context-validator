import {JSONSchemaType} from 'ajv'
import {APIRequest, constantResponseRequest} from './api-request'
import {APIFetcher} from './api-fetcher'

export interface PaginatedResponse<Item> {
  // eslint-disable-next-line camelcase
  next_page_token: string | null
  items: Item[]
}

export function paginatedSchema<Item>(itemSchema: JSONSchemaType<Item>): JSONSchemaType<PaginatedResponse<Item>> {
  return {
    type: 'object',
    required: ['next_page_token', 'items'],
    additionalProperties: true,
    properties: {
      next_page_token: { // eslint-disable-line camelcase
        type: 'string',
        nullable: true,
      },
      items: {
        type: 'array',
        items: itemSchema,
      },
    },
  }
}

const withPageToken: (_: string) => (_: APIFetcher) => APIFetcher =
  pageToken => fetcher => requestParams => {
    const newParams = {...requestParams}
    newParams.params['page-token'] = pageToken

    return fetcher(newParams)
  }

export const paginatedRequest: <Item>(_: APIRequest<PaginatedResponse<Item>>) => APIRequest<Item[]> =
  request =>
    request.flatMap(response => response.next_page_token ?
      makeNextPageRequest(request, response) :
      constantResponseRequest(response.items))

const makeNextPageRequest: <Item>(request: APIRequest<PaginatedResponse<Item>>, response: PaginatedResponse<Item>) => APIRequest<Item[]> =
  (request, response) =>
    paginatedRequest(request.mapFetcher(withPageToken(response.next_page_token as string)))
    .map(items => [...response.items, ...items])

