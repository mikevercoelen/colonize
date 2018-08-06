const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String
  },
  name: {
    type: String
  },
  ownedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Organisation'
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
