const path = require('path')
const expect = require('expect')
const colonize = require('../index')
const connectionUrl = 'mongodb://localhost:27017/colonize-test'

describe('Colonize', () => {
  let _colonization = null

  after(async () => {
    await _colonization.close()
  })

  it('should correctly initialize', () => {
    _colonization = colonize.initialize({
      mongoUrl: connectionUrl,
      connectionWhitelist: [
        connectionUrl
      ],
      dropDatabase: false,
      seedingPath: path.resolve(__dirname, './seeding')
    })

    expect(_colonization).toHaveProperty('seed')
    expect(typeof _colonization.seed).toEqual('function')
    expect(_colonization).toHaveProperty('close')
    expect(typeof _colonization.close).toEqual('function')
  })

  it('should seed and have global stash and refs defined', async () => {
    const { refs, stash } = await _colonization.seed()
    expect(stash).toHaveProperty('users')
    expect(refs).toHaveProperty('users')
    expect(stash).toHaveProperty('organisations')
    expect(refs).toHaveProperty('organisations')
    expect(refs.organisations).toHaveProperty('primary')
    expect(refs.users).toHaveProperty('primary')
  })
})
