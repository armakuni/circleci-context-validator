import {Command, Flags} from '@oclif/core'
import {loadYamlFile} from '../../lib/yaml-files'
import {validate} from '../../config/validator'
import {Environment, loadEnvironment} from '../../lib/environment'
import {fetchContexts, GetContextsResponse} from '../../circleci'
import ApiRequestError from '../../circleci/api-request-error'
import BadApiResponseDataError from '../../circleci/bad-api-response-data-error'
import {Config} from '../../config/config'

export default class Validate extends Command {
  public static description = 'Validate that CircleCI contexts have required values.';

  public static examples = [
    'export CIRCLE_CI_PERSONAL_API_TOKEN=123abc',
    '$ run circleci:validate --context-definitions contexts.yml --circleci-config .circleci/config.yaml',
  ];

  public static flags = {
    help: Flags.help({char: 'h'}),
    'context-definitions': Flags.string({
      required: true,
      description: 'A YAML file which describes which contexts to check',
    }),
  //   'circleci-config': Flags.string({
  //     required: false,
  //     description: 'The config file for CircleCI',
  //   }),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(Validate)
    const environment = this.loadEnvironment()

    const yamlProjectConfigPath = flags['context-definitions']
    const jsonProjectConfigContents = await loadYamlFile(yamlProjectConfigPath)

    const config = validate(jsonProjectConfigContents)

    const result = await this.fetchCircleCIContexts(config, environment)

    this.log(JSON.stringify(result))

    this.log('Success')
  }

  private async fetchCircleCIContexts(config: Config, environment: Environment): Promise<GetContextsResponse> {
    try {
      return await fetchContexts(config.owner.id, environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)
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
