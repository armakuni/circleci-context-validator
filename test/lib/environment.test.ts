import {describe} from 'mocha'
import {expect} from 'chai'
import {loadEnvironment} from '../../src/lib/environment'

describe('environment', () => {
  describe('load()', () => {
    it('throws when CIRCLECI_PERSONAL_ACCESS_TOKEN is not set', () => {
      delete process.env.CIRCLECI_PERSONAL_ACCESS_TOKEN
      expect(() => loadEnvironment()).to.throw('CIRCLECI_PERSONAL_ACCESS_TOKEN environment variable is not set')
    })

    it('throws when CIRCLECI_PERSONAL_ACCESS_TOKEN is empty', () => {
      process.env.CIRCLECI_PERSONAL_ACCESS_TOKEN = ''
      expect(() => loadEnvironment()).to.throw('CIRCLECI_PERSONAL_ACCESS_TOKEN environment variable is not set')
    })

    it('returns the environment', () => {
      process.env.CIRCLECI_PERSONAL_ACCESS_TOKEN = 'pat123'
      expect(loadEnvironment()).to.eql({CIRCLECI_PERSONAL_ACCESS_TOKEN: 'pat123'})
    })
  })
})
