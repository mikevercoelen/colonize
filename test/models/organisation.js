const mongoose = require('mongoose')
const Schema = mongoose.Schema

const organisationSchema = new Schema({
  name: {
    type: String
  }
})

const Organisation = mongoose.model('Organisation', organisationSchema)

module.exports = Organisation
