import {JSONSchemaType} from 'ajv'
import {Config} from './config'

export const schema: JSONSchemaType<Config> = {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Root',
  description: 'Container object for context env var validation',
  type: 'object',
  required: ['owner', 'contexts'],
  additionalProperties: false,
  properties: {
    owner: {
      title: 'Owner',
      type: 'object',
      required: ['id'],
      additionalProperties: false,
      properties: {
        id: {
          title: 'Id',
          type: 'string',
          description: 'The unique identifier UUID for the owner of a context',
          default: '',
          examples: ['80025e7e-1268-4491-8656-221970905a18'],
          pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        },
      },
    },
    contexts: {
      title: 'Contexts',
      type: 'array',
      default: [],
      minItems: 1,
      items: {
        title: 'Items',
        type: 'object',
        required: ['name', 'purpose', 'environment-variables'],
        additionalProperties: false,
        properties: {
          name: {
            title: 'Name',
            type: 'string',
            default: '',
            examples: ['legacy-production'],
            pattern: '^[a-zA-Z0-9_-]+$',
          },
          purpose: {
            title: 'Purpose',
            type: 'string',
            default: '',
            examples: ['Used for ec2 production environment'],
            pattern: '^.*$',
          },
          'environment-variables': {
            title: 'Environment-variables',
            type: 'object',
            additionalProperties: false,
            required: [],
            patternProperties: {
              '^[a-zA-Z0-9_-]+$': {
                type: 'object',
                required: [
                  'state',
                  'purpose',
                ],
                additionalProperties: false,
                properties: {
                  state: {
                    title: 'State',
                    type: 'string',
                    enum: [
                      'required',
                      'optional',
                    ],
                    default: '',
                    examples: [
                      'required',
                      'optional',
                    ],
                  },
                  purpose: {
                    title: 'Purpose',
                    type: 'string',
                    default: '',
                    examples: [
                      'AWS API usage with CLI Tool for assuming roles',
                    ],
                    pattern: '^.+$',
                  },
                  labels: {
                    title: 'Labels',
                    type: 'array',
                    default: [],
                    maxItems: 10,
                    uniqueItems: true,
                    items: {
                      title: 'Items',
                      type: 'string',
                      default: '',
                      examples: [
                        'tooling, aws, metrics, legacy, poc',
                      ],
                      pattern: '^.+$',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}
