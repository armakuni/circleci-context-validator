import {Command, Flags} from '@oclif/core'
import * as yaml from 'js-yaml'
import {Environment, loadEnvironment} from '../../lib/environment'
import {Config} from '../../config/config'
import {APIFetcher, ApiRequestError, BadApiResponseDataError, createFetcher} from '../../circleci'
import {getContextsWithEnvVars} from '../../context-validator/request'
import {create} from '../../config/creator'

export default class CreateConfig extends Command {
  public static enableJsonFlag = true

  public static description = 'Create a config file from existing contexts.';

  public static examples = [
    'export CIRCLE_CI_PERSONAL_API_TOKEN=123abc',
    '$ run circleci:create-config --owner-id user100 --contexts context-one',
  ];

  public static flags = {
    help: Flags.help({char: 'h'}),
    'owner-id': Flags.string({
      required: true,
      description: 'The CircleCI account owner-id.',
    }),
    contexts: Flags.string({
      required: true,
      description: 'The names of the contexts you want to include in your config',
    }),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(CreateConfig)

    const env = this.loadEnvironment()

    const fetcher = createFetcher(env.CIRCLECI_PERSONAL_ACCESS_TOKEN)
    const config = await this.fetchContextsAndGenerateConfig(flags['owner-id'], flags.contexts.split(','), fetcher)

    this.log(yaml.dump(config))
    this.exit(0)
  }

  private async fetchContextsAndGenerateConfig(ownerId: string, contexts: string[], fetcher: APIFetcher): Promise<Config> {
    try {
      return await getContextsWithEnvVars(ownerId, new Set(contexts)).map(fetched => create(ownerId, fetched))(fetcher)
    } catch (error) {
      if (error instanceof ApiRequestError || error instanceof BadApiResponseDataError) {
        this.error('CircleCI API request failed: \n' + (error as Error).toString(), {
          code: 'CIRCLECI_API_REQUEST_FAILED',
        })
      }

      throw error
    }
  }

  private loadEnvironment(): Environment {
    try {
      return loadEnvironment()
    } catch (error) {
      this.error((error as Error).toString(), {
        code: 'MISSING_API_TOKEN',
        suggestions: [
          'Set CIRCLECI_PERSONAL_ACCESS_TOKEN to a Personal API Token for CircleCI',
          'For details on creating a Personal API Token, see https://circleci.com/docs/2.0/managing-api-tokens/#creating-a-personal-api-token',
        ],
      })
    }
  }
}
