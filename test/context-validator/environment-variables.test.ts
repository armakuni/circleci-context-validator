import {expect} from 'chai'
import {
  analyseAll,
  AnalysedEnvVar,
  Analyser, validateAll,
  validateSingle,
  Validator,
} from '../../src/context-validator/environment-variables'
import {ExpectedContext} from '../../src/config/config'
import {MissingEnvVarError} from '../../src/context-validator/types'
import {FetchedEnvVar} from '../../src/circleci/get-context-environment-variables'

describe('context-validator', () => {
  describe('validateSingle', () => {
    it('returns MissingEnvVarError when the env var does not exist', () => {
      const envVar: AnalysedEnvVar = {
        exists: false,
        labels: [],
        name: 'example_env_var',
        purpose: '',
        state: '',
      }
      expect(validateSingle(envVar)).to.eql([new MissingEnvVarError('example_env_var')])
    })

    it('returns an empty list when the env var does exist', () => {
      const envVar: AnalysedEnvVar = {
        exists: true,
        labels: [],
        name: 'example_env_var',
        purpose: '',
        state: '',
      }
      expect(validateSingle(envVar)).to.eql([])
    })
  })

  describe('analyseAll', () => {
    const context: ExpectedContext = {
      name: 'example-context',
      purpose: '',
      'environment-variables': {
        ENV_VAR1: {
          state: 'required',
          purpose: 'example-purpose',
          labels: ['label1', 'label2'],
        },
      },
    }

    it('adds the name and sets exists to false when not in the fetched env vars', () => {
      const fetched: FetchedEnvVar[] = []
      expect(analyseAll(context)(fetched)).to.eql(
        [{
          name: 'ENV_VAR1',
          exists: false,
          state: 'required',
          purpose: 'example-purpose',
          labels: ['label1', 'label2'],
        }],
      )
    })

    it('adds the name and sets exists to true when in the fetched env vars', () => {
      const fetched: FetchedEnvVar[] = [{variable: 'ENV_VAR1'}]
      expect(analyseAll(context)(fetched)).to.eql(
        [{
          name: 'ENV_VAR1',
          exists: true,
          state: 'required',
          purpose: 'example-purpose',
          labels: ['label1', 'label2'],
        }],
      )
    })

    it('ignores unknown fetched env vars', () => {
      const fetched: FetchedEnvVar[] = [{variable: 'ENV_VAR2'}]
      expect(analyseAll(context)(fetched)).to.eql(
        [{
          name: 'ENV_VAR1',
          exists: false,
          state: 'required',
          purpose: 'example-purpose',
          labels: ['label1', 'label2'],
        }],
      )
    })
  })

  describe('validateAll', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const analyser: Analyser = fetchedEnvVars => fetchedEnvVars.map(({variable}) => ({
      name: variable,
      exists: false,
      state: 'required',
      purpose: 'analysed-purpose',
      labels: ['label1', 'label2'],
    }))

    it('returns the combined the output of all validates', () => {
      const validator: Validator = analysedEnvVar => [new MissingEnvVarError(analysedEnvVar.name)]

      const fetched = [{variable: 'ENV_VAR1'}, {variable: 'ENV_VAR2'}]

      const result = validateAll(analyser, validator)(fetched)

      expect(result).to.eql([
        new MissingEnvVarError('ENV_VAR1'),
        new MissingEnvVarError('ENV_VAR2'),
      ])
    })

    it('returns empty array when no other results results are present', () => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const validator: Validator = _ => []

      const fetched = [{variable: 'ENV_VAR1'}, {variable: 'ENV_VAR2'}]

      const result = validateAll(analyser, validator)(fetched)

      expect(result).to.eql([])
    })
  })
})

