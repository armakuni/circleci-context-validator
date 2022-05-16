import {APIFetcher, ApiRequestError, RequestParams} from '../../src/circleci'

/**
 * Mock version of APIFetcher for returning pre-canned known responses based on a URI path
 * @param responses mocked output to return based on a URI path existence
 * @returns mocked output or api error
 */
export const mockFetcher = (responses: {requestParams: RequestParams, response: any}[]): APIFetcher =>
  (requestParams: RequestParams) => {
    for (const res of responses) {
      if (RequestParams.equal(requestParams, res.requestParams)) {
        return Promise.resolve(res.response)
      }
    }

    throw new ApiRequestError('failed to find response with path')
  }
