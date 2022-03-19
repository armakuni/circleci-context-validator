import {ExpectedContext} from '../config/config'
import {IdentifiedContext} from './types'
import {FetchedContext} from '../circleci'

type ContextIdentifier = (_: ExpectedContext) => ExpectedContext | IdentifiedContext

export const ids: (_: FetchedContext[]) => Map<string, string> =
  contexts =>
    new Map(contexts.map(context => [context.name, context.id]))

export const singleIdentifier: (contextIds: Map<string, string>) => ContextIdentifier =
  contextIds => context => {
    const id = contextIds.get(context.name)
    return id === undefined ? context : {...context, id}
  }

export const multiIdentifier: (_: ExpectedContext[]) => (_: ContextIdentifier) => (ExpectedContext | IdentifiedContext)[] =
  expectedContexts => identifyContext =>
    expectedContexts.map(context => identifyContext(context))

export function isIdentified(context: ExpectedContext | IdentifiedContext): context is IdentifiedContext {
  return 'id' in context
}
