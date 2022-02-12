import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import * as yaml from 'js-yaml'

export const TEMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'circleci-context-validator-tests'))

export function tempFilePath(filename: string): string {
  return path.join(TEMP_DIR, filename)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createTempYamlFile(filename: string, content: any): void {
  fs.writeFileSync(tempFilePath(filename), yaml.dump(content))
}
