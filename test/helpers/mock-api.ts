import {APIFetcher, ApiRequestError} from '../../src/circleci'

/**
 * Mock version of APIFetcher for returning pre-canned known responses based on a URI path
 * @param responses mocked output to return based on a URI path existence
 * @returns mocked output or api error
 */
export const mockFetcher = (responses: any): APIFetcher => {
  const mappedResponses = new Map(Object.entries(responses))
  return (path: string) => {
    if (mappedResponses.has(path)) {
      return Promise.resolve(mappedResponses.get(path))
    }

    throw new ApiRequestError('failed to find response with path')
  }
}
