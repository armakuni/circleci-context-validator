import {expect} from 'chai'
import {ids, isIdentified, multiIdentifier, singleIdentifier} from '../../src/context-validator/contexts'
import {ExpectedContext} from '../../src/config/config'
import {IdentifiedContext} from '../../src/context-validator/types'

describe('contexts', () => {
  const contexts = [
    {name: 'context-1', id: '1'},
    {name: 'context-2', id: '2'},
  ]

  const contextIds = ids(contexts)

  describe('ids', () => {
    it('returns a map of context name to id', () => {
      expect(contextIds.get('context-1')).to.eql('1')
      expect(contextIds.get('context-2')).to.eql('2')
    })
  })

  describe('singleIdentifier', () => {
    it('returns an identified context if the id exists', () => {
      const context = {
        name: 'context-1',
        purpose: '',
        'environment-variables': {},
      }
      expect(singleIdentifier(contextIds)(context)).to.eql({...context, id: '1'})
    })

    it('returns the untouched context if the id does not exists', () => {
      const context = {
        name: 'unknown-context',
        purpose: '',
        'environment-variables': {},
      }
      expect(singleIdentifier(contextIds)(context)).to.eql(context)
    })
  })

  describe('multiIdentifier', () => {
    it('returns the results of applying the single identified for each context', () => {
      const contexts = [
        {
          name: 'context-1',
          purpose: '',
          'environment-variables': {},
        },
        {
          name: 'context-2',
          purpose: '',
          'environment-variables': {},
        },
      ]

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const identifier = (context: ExpectedContext) => ({...context, id: `${context.name}-id`})

      expect(multiIdentifier(contexts)(identifier)).to.eql(
        [
          {
            id: 'context-1-id',
            name: 'context-1',
            purpose: '',
            'environment-variables': {},
          },
          {
            id: 'context-2-id',
            name: 'context-2',
            purpose: '',
            'environment-variables': {},
          },
        ],
      )
    })
  })

  describe('isIdentified', () => {
    it('returns false if the context does not have an id', () => {
      const context: ExpectedContext = {
        name: 'example-context',
        purpose: 'Example context',
        'environment-variables': {},
      }

      expect(isIdentified(context)).to.eq(false)
    })

    it('returns true if the context an id', () => {
      const context: IdentifiedContext = {
        id: 'example-id',
        name: 'example-context',
        purpose: 'Example context',
        'environment-variables': {},
      }

      expect(isIdentified(context)).to.eq(true)
    })
  })
})
