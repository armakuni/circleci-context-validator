import {create} from '../../src/config/creator'
import {expect} from 'chai'

describe('create', () => {
  it('returns the config', () => {
    const ownerId = '2642f40c-9414-454d-881b-fd59586edafd'
    const config = create(ownerId, [
      {
        name: 'example-context',
        environmentVariables: ['ENV1', 'ENV2'],
      },
    ])

    expect(config).to.eql({
      owner: {id: ownerId},
      contexts: [
        {
          name: 'example-context',
          purpose: '',
          'environment-variables': {
            ENV1: {
              state: 'required',
              purpose: '',
              labels: ['imported'],
            },
            ENV2: {
              state: 'required',
              purpose: '',
              labels: ['imported'],
            },
          },
        },
      ],
    })
  })
})
