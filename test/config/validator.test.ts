import {validateConfig} from '../../src/config/validator'
import {expect} from 'chai'

/* eslint max-nested-callbacks: "off" */

describe('validator', () => {
  describe('validate', () => {
    let config: any

    beforeEach(() => {
      config = {
        owner: {id: '88025e7e-1268-4491-8756-221970905a18'},
        contexts: [
          {
            name: 'legacy-production',
            purpose: 'Used for ec2 production environment',
            'environment-variables': {
              AWS_SECRET_KEY_VALUE: {
                state: 'required',
                purpose: 'Required for AWS API usage on CLI Tool',
                labels: ['tooling', 'aws'],
              },
            },
          },
        ],
      }
    })

    it('returns the config when it is valid', () => {
      expect(validateConfig(config)).to.eql(config)
    })

    it('throws an error extra properties are defined', () => {
      config.unknown = 'hello'
      expect(() => validateConfig(config)).to.throw(Error, /must NOT have additional properties/)
    })

    context('.owner', () => {
      it('throws an error when missing', () => {
        delete config.owner
        expect(() => validateConfig(config)).to.throw(Error, /must have required property 'owner'/)
      })

      it('throws an error extra properties are defined', () => {
        config.owner.unknown = 'hello'
        expect(() => validateConfig(config)).to.throw(Error, /must NOT have additional properties/)
      })

      context('.id', () => {
        it('throws an error missing', () => {
          delete config.owner.id
          expect(() => validateConfig(config)).to.throw(Error, /must have required property 'id'/)
        })

        it('throws an error is invalid', () => {
          config.owner.id = '123'
          expect(() => validateConfig(config)).to.throw(Error, /must match pattern/)
        })
      })
    })

    context('.contexts', () => {
      it('throws an error when missing', () => {
        delete config.contexts
        expect(() => validateConfig(config)).to.throw(Error, /must have required property 'contexts'/)
      })

      it('throws an error when empty', () => {
        config.contexts = []
        expect(() => validateConfig(config)).to.throw(Error, /must NOT have fewer than 1 items/)
      })

      it('throws an error when not an array', () => {
        config.contexts = ''
        expect(() => validateConfig(config)).to.throw(Error, /must be array/)
      })

      it('throws an error extra properties are defined', () => {
        config.contexts[0].unknown = 'hello'
        expect(() => validateConfig(config)).to.throw(Error, /must NOT have additional properties/)
      })

      context('.name', () => {
        it('throws an error when missing', () => {
          delete config.contexts[0].name
          expect(() => validateConfig(config)).to.throw(Error, /must have required property 'name'/)
        })

        it('throws an error when invalid', () => {
          config.contexts[0].name = 'bad!!name'
          expect(() => validateConfig(config)).to.throw(Error, /must match pattern/)
        })
      })

      context('.purpose', () => {
        it('throws an error when missing', () => {
          delete config.contexts[0].purpose
          expect(() => validateConfig(config)).to.throw(Error, /must have required property 'purpose'/)
        })

        it('throws an error when not a string', () => {
          config.contexts[0].purpose = 1
          expect(() => validateConfig(config)).to.throw(Error, /must be string/)
        })
      })

      context('.environment-variables', () => {
        it('throws an error when missing', () => {
          delete config.contexts[0]['environment-variables']
          expect(() => validateConfig(config)).to.throw(Error, /must have required property 'environment-variables'/)
        })

        it('throws an error when not an object', () => {
          config.contexts[0]['environment-variables'] = 1
          expect(() => validateConfig(config)).to.throw(Error, /must be object/)
        })

        it('returns the config when empty', () => {
          config.contexts[0]['environment-variables'] = {}
          expect(validateConfig(config)).to.eql(config)
        })

        context('for an environment variable', () => {
          it('throws an error when name is bad', () => {
            config.contexts[0]['environment-variables']['++bad!!name++'] =  {}
            // This is a bit of a misleading error, but that's what the JSON schema validation error provides
            expect(() => validateConfig(config)).to.throw(Error, /must NOT have additional properties/)
          })

          it('throws an error extra properties are defined', () => {
            config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.unknown = 'hello'
            expect(() => validateConfig(config)).to.throw(Error, /must NOT have additional properties/)
          })

          context('.purpose', () => {
            it('throws an error when missing', () => {
              delete config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.purpose
              expect(() => validateConfig(config)).to.throw(Error, /must have required property 'purpose'/)
            })

            it('throws an error when not a string', () => {
              config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.purpose = 1
              expect(() => validateConfig(config)).to.throw(Error, /must be string/)
            })
          })

          context('.state', () => {
            it('throws an error when missing', () => {
              delete config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.state
              expect(() => validateConfig(config)).to.throw(Error, /must have required property 'state'/)
            })

            it('throws an error when not a string', () => {
              config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.state = 1
              expect(() => validateConfig(config)).to.throw(Error, /must be equal to one of the allowed values/)
            })

            it('throws an error when invalid', () => {
              config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.state = 'invalid state'
              expect(() => validateConfig(config)).to.throw(Error, /must be equal to one of the allowed values/)
            })

            it('returns the config when it is set to "required"', () => {
              config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.state = 'required'
              expect(validateConfig(config)).to.eql(config)
            })

            it('returns the config when it is set to "optional"', () => {
              config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.state = 'optional'
              expect(validateConfig(config)).to.eql(config)
            })
          })

          context('.labels', () => {
            it('returns the config when missing', () => {
              delete config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.labels
              expect(validateConfig(config)).to.eql(config)
            })

            it('returns the config when empty', () => {
              config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.labels = []
              expect(validateConfig(config)).to.eql(config)
            })

            it('throws an error when not an array', () => {
              config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.labels = 1
              expect(() => validateConfig(config)).to.throw(Error, /must be array/)
            })

            it('throws containing non string items', () => {
              config.contexts[0]['environment-variables'].AWS_SECRET_KEY_VALUE.labels = [1]
              expect(() => validateConfig(config)).to.throw(Error, /must be string/)
            })
          })
        })
      })
    })
  })
})
