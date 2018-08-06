const createOrganisation = (refs, data) => ({
  ...data
})

module.exports = [
  refs => ({
    model: () => require('../models/organisation'),
    refName: 'organisations',
    entities: [{
      refName: 'primary',
      data: createOrganisation(refs, {
        name: 'Apple'
      })
    }, {
      refName: 'secondary',
      data: createOrganisation(refs, {
        name: 'Microsoft'
      })
    }]
  })
]
