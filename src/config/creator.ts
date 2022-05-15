import {Config, ExpectedContext} from './config'
import {FetchedContext} from '../context-validator/request'

const environmentVariablesConfig: (_: FetchedContext) => { [k: string]: { state: string, purpose: string, labels: string[] } } =
  context =>
    Object.fromEntries(context.environmentVariables.map(name => [name, {
      state: 'required',
      purpose: '',
      labels: ['imported'],
    }]))

const contextConfig: (_: FetchedContext) => ExpectedContext =
  context =>
    ({
      name: context.name,
      purpose: '',
      'environment-variables': environmentVariablesConfig(context),
    })

export const create: (ownerId: string, contexts: FetchedContext[]) => Config =
  (ownerId, contexts) =>
    ({
      owner: {id: ownerId},
      contexts: contexts.map(context => contextConfig(context)),
    })
