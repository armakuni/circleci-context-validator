import {Command, Flags} from '@oclif/core'
import {loadYamlFile} from '../../lib/yaml-files'
import {validateConfig} from '../../config/validator'
import {Environment, loadEnvironment} from '../../lib/environment'
import {Config} from '../../config/config'
import {ApiRequestError, BadApiResponseDataError} from '../../circleci'
import {validateContexts} from '../../context-validator'
import {ContextMissingResult, ContextValidatorResult} from '../../context-validator/types'
import * as chalk from 'chalk' // eslint-disable-line unicorn/import-style

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
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(Validate)

    const environment = this.loadEnvironment()
    const config = await Validate.loadConfig(flags['context-definitions'])

    const results = await this.fetchCircleCIContexts(config, environment)

    for (const result of results) {
      if (result instanceof ContextMissingResult) {
        this.log(chalk.red(`Context "${result.contextName}" is missing`))
      }
    }

    this.log(JSON.stringify(results))

    this.log(chalk.green('Success'))
  }

  private static async loadConfig(configPath: string) {
    return validateConfig(await loadYamlFile(configPath))
  }

  private async fetchCircleCIContexts(config: Config, environment: Environment): Promise<ContextValidatorResult[]> {
    try {
      return await validateContexts(config, environment)
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
