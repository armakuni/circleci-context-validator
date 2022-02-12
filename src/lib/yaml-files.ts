import {readFile} from 'node:fs/promises'
import {load} from 'js-yaml'

export async function loadYamlFile(path: string): Promise<unknown> {
  const contents = await readFile(path, 'utf8')
  return load(contents, {json: true})
}
