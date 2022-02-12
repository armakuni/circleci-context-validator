import {describe} from 'mocha'
import {createTempYamlFile, tempFilePath} from '../helpers/test-files'
import {loadYamlFile} from '../../src/lib/yaml-files'
import {expect} from 'chai'

describe('yaml-files', () => {
  describe('loadYamlFile', () => {
    it('loads the YAML file', async () => {
      createTempYamlFile('example.yml', {message: 'hello world'})
      const data = await loadYamlFile(tempFilePath('example.yml'))
      expect(data).to.eql({message: 'hello world'})
    })
  })
})
