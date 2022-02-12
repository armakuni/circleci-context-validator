import {Command, Flags} from '@oclif/core'
import {loadYamlFile} from '../../lib/yaml-files'
import isValid from '../../config/validator'

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

    // const envVar = 'CIRCLE_CI_PERSONAL_API_TOKEN';
    // if (process.env[envVar] === undefined) {
    //   this.error(`${envVar} environment variable is not set`, {
    //     code: 'MISSING_API_TOKEN',
    //     suggestions: [
    //       'Set CIRCLE_CI_PERSONAL_API_TOKEN to a Personal API Token for CircleCI',
    //       'For details on creating a Personal API Token, see https://circleci.com/docs/2.0/managing-api-tokens/#creating-a-personal-api-token',
    //     ],
    //   });
    // }

    // this.error('CIRCLE_CI_PERSONAL_API_TOKEN is invalid', {
    //   code: 'MISSING_API_TOKEN',
    //   suggestions: [
    //     'Set CIRCLE_CI_PERSONAL_API_TOKEN to a Personal API Token for CircleCI',
    //     'For details on creating a Personal API Token, see https://circleci.com/docs/2.0/managing-api-tokens/#creating-a-personal-api-token',
    //   ],
    // });

    const yamlProjectConfigPath = flags['context-definitions']
    const jsonProjectConfigContents = await loadYamlFile(yamlProjectConfigPath)

    isValid(jsonProjectConfigContents)

    this.log('Success')
  }
}
