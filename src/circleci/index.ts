import fetch from 'node-fetch'
import Ajv, {ErrorObject, JSONSchemaType} from 'ajv'
import betterAjvErrors from 'better-ajv-errors'
import {schema} from '../config/schema'

interface GetContextsResponse {
  items: ContextItem[]
}

interface ContextItem {
  name: string
  id: string
}

const listContextResponseSchema: JSONSchemaType<GetContextsResponse> = {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Root',
  type: 'object',
  required: ['items'],
  additionalProperties: true,
  properties: {
    items: {
      title: 'Contexts',
      type: 'array',
      default: [],
      items: {
        title: 'Items',
        type: 'object',
        required: ['id', 'name'],
        additionalProperties: true,
        properties: {
          name: {
            title: 'Name',
            type: 'string',
          },
          id: {
            title: 'ID',
            type: 'string',
          },
        },
      },
    },
  },
}

export async function fetchContexts(ownerId: string, personalAccessToken: string): Promise<any> {
  const response = await fetch(`https://circleci.com/api/v2/context?owner-id=${ownerId}`, {
    headers: {
      'Circle-Token': personalAccessToken,
    },
  })

  if (response.status !== 200) {
    throw new Error(`Failed to make request to CircleCI API: [${response.status}] ${await response.text()}`)
  }

  const contexts = await response.json()

  const ajv = new Ajv({allErrors: true})
  const validate = ajv.compile(listContextResponseSchema)
  const valid = validate(contexts)

  if (!valid) {
    const output = betterAjvErrors(schema, contexts, validate.errors as ErrorObject[])

    throw new Error(output)
  }

  return contexts.items
}
