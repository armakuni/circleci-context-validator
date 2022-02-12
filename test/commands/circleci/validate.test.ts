import {expect, test} from '@oclif/test'

describe('circleci validate', () => {
  test
  .stdout()
  .command(['circleci validate'])
  .it('runs the circleci validate command', ctx => {
    expect(ctx.stdout).to.contain('Success')
  })
})
