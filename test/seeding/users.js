const createUser = (refs, data) => ({
  ownedBy: refs.organisations.primary._id,
  ...data
})

module.exports = [
  refs => ({
    model: () => require('../models/user'),
    refName: 'users',
    entities: [{
      refName: 'primary',
      data: createUser(refs, {
        name: 'Mike Vercoelen'
      })
    }, {
      refName: 'secondary',
      data: createUser(refs, {
        name: 'Tom Grooffer'
      })
    }]
  })
]
