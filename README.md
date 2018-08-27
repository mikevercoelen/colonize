# Colonize

Scalable Mongoose seeding

* Modular seeding: split your seeding into multiple files
* Dynamic seeding with relationships between seeding files

## Getting started

```shell
npm install colonize --save-dev
```

## Usage

We're gonna demonstrate the usage by the demo setup which exists in the [`test`](https://github.com/mikevercoelen/colonize/tree/master/test) folder, so check that out for a full example.

Let's take a look at the following example Mongoose models:

`models/organisation.js`
```js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const organisationSchema = new Schema({
  name: {
    type: String
  }
})

const Organisation = mongoose.model('Organisation', organisationSchema)

module.exports = Organisation
```

`models/user.js`
```js
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
```

As you can see, the `User` model has an `ownedBy` field which refers to an organisation. So when we have seeding we want to have a setup that supports these kinds of situations, and that's exactly why `colonize` is perfect. It's super small (only about 200 loc) and smart.

* Create your `seeding` folder, for example: `./test/seeding`
* Create your first seeding file in the folder, let's say organisation.

`test/seeding/organisation.js`
```js
module.exports = [
  () => ({
    model: () => require('../models/organisation'),
    refName: 'organisations',
    entities: [{
      refName: 'primary',
      data: {
        name: 'Apple'
      })
    }]
  })
]
```

The file exports an array of functions, why becomes clear later on. Each of those functions is called a `seeding set`. A seeding set requires the following properties:

* `model`: a function that exports the model: `model: () => require('../models/organisation')`
* `refName`: a special name, which you can use later on to access the entities like: `refs.<SEEDING_SET_REF_NAME>.<ENTITY_REF_NAME>` (for example: `refs.organisations.primary`)
* `entities`: an array of the entities you want to create, each entity exports: `refName` (optional) and `data`

Now let's create the users seeding file, and in our current model setup, a user depends on an organisation. We can use refs to refer to an organisation.

`test/seeding/users.js`
```js
module.exports = [
  refs => ({
    model: () => require('../models/user'),
    refName: 'users',
    entities: [{
      refName: 'primary',
      data: {
        ownedBy: refs.organisations.primary._id,
        name: 'Michael Jackson'
      }
    }]
  })
]
```

Now let's create `test/seeding/index.js`, the main file that exports all the seeding files.

**NOTE**: This file is important because the order that is defined in this file, defines the order of all the seeds to be ran.

`test/seeding/index.js`
```js
const organisations = require('./organisations')
const users = require('./users')

module.exports = [{
  // So first we seed the organisations
  organisations
}, {
  // Then the users, because: users depend on the organisations
  users
}]
```

Now lets setup the seeding. If you'r using Mocha: create a file that is required in all the tests which defines a global `before` and `after` hook

`setup.mocha.js`
```js
const colonize = require('colonize')
const pkg = require('./package')

const mongoUrl = 'mongodb://127.0.0.1:27017/${pkg.name}-test'

const colonization = colonize.initialize({
  mongoUrl,
  seedingPath: path.resolve(__dirname, './test/seeding'),

  // Connection whitelist is important, it's a list of allowed connections (this is to double check we're not seeding / dropping a live database)
  connectionWhitelist: [
    mongoUrl
  ]
})

before(async () => {
  const { refs, stash } = await colonization.seed()

  // Once you set them here, you can use these in your tests to refer to all the created data ;)
  global.stash = stash
  global.refs = refs
})

// Don't forget to call `close`
after(async () => {
  await colonization.close()
})
```

That's it, you're all setup.

Now let's take a look at how you can use this in an example test:

`users.test.js`
```js
const request = require('supertest')
const expect = require('expect')

describe('GET /users/:id', () => {
  it('should correctly return a user', () => {
    // As you can see, this is how you can use refs to refer to seeded entities
    const primaryUserId = global.refs.users.primary._id

    return request
      .get(`/users/${primaryUserId`)
      .expect(200)
  })
})
```
