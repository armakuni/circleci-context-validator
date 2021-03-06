import {Command, Flags} from '@oclif/core'
import {loadYamlFile} from '../../lib/yaml-files'
import {validateConfig} from '../../config/validator'
import {Environment, loadEnvironment} from '../../lib/environment'
import {Config} from '../../config/config'
import {APIFetcher, ApiRequestError, BadApiResponseDataError, createFetcher} from '../../circleci'
import {validateContexts} from '../../context-validator'
import {ContextValidatorResult} from '../../context-validator'
import {formatResult} from '../../formatter/console'

export default class Validate extends Command {
  public static enableJsonFlag = true

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
  };

  /*
   * Orchestrate the validation process
   * - Load env vars required for circle api
   * - Load context definition yaml config containing context/env vars to validate
   * - Collect contexts provided in config yaml from circle api (paginated)
   * - Determine valid and missing/unassociated contexts
   * - Process any valid contexts to retrieve env vars associated
   * - output and exit with appropriate code
   */
  public async run(): Promise<void> {
    const {flags} = await this.parse(Validate)

    const environment = this.loadEnvironment()
    const config = await Validate.loadConfig(flags['context-definitions'])
    const fetcher = createFetcher(environment.CIRCLECI_PERSONAL_ACCESS_TOKEN)

    const results = await this.validateCircleCIContexts(config, fetcher)

    const exitCode = formatResult(results)

    this.exit(exitCode)
  }

  private static async loadConfig(configPath: string) {
    return validateConfig(await loadYamlFile(configPath))
  }

  private async validateCircleCIContexts(config: Config, fetcher: APIFetcher): Promise<ContextValidatorResult[]> {
    try {
      return await validateContexts(config)(fetcher)
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
