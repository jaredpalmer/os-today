/* eslint-env mocha */
import expect from 'expect'

import '../server'

describe('App', (done) => {
  it('exists', (done) => {
    expect('something truthy').toExist()
    done()
  })
})
