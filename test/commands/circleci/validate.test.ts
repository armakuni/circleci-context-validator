import {expect, test} from '@oclif/test'
import * as os from 'node:os'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as yaml from 'js-yaml'

const TEMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'circleci-context-validator-tests'))

function tempFilePath(filename: string): string {
  return path.join(TEMP_DIR, filename)
}

function createTempYamlFile(filename: string, content: any): void {
  fs.writeFileSync(tempFilePath(filename), yaml.dump(content))
}

describe('circleci validate', () => {
  test
  .do(() => {
    createTempYamlFile('valid_config.yml', {
      owner: {
        id: '88025e7e-1268-4491-8756-221970905a18',
      },

      contexts: [
        {
          name: 'legacy-production',
          purpose: 'Used for ec2 production environment # What is the purpose of this context',
          'environment-variables': {
            AWS_SECRET_KEY_VALUE: {
              state: 'required',
              purpose: 'Required for AWS API usage on CLI Tool',
              labels: ['tooling', 'aws'],
            },
          },
        },
      ],
    },
    )
  })
  .stdout()
  .command(['circleci validate', '--context-definitions', tempFilePath('valid_config.yml')])
  .it('runs the circleci validate successfully', ctx => {
    expect(ctx.stdout).to.contain('Success')
  })

  test
  .do(() => createTempYamlFile('invalid_config.yml', {
    owner: {
      id: '88025e7e-1268-4491-8756-221970905a18',
    },
  }))
  .command(['circleci validate', '--context-definitions', tempFilePath('invalid_config.yml')])
  .catch(error => {
    expect(error.toString()).to.contain("must have required property 'contexts'")
  })
  .it('runs the circleci validate command')
})
