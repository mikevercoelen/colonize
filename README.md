# Colonize

Scalable Mongoose seeding:

* Modular seeding: split your seeding into multiple files
* Dynamic seeding with relationships between seeding files

## Getting started

```shell
npm install colonize --save-dev
```

## Usage

We're gonna demonstrate the usage by the demo setup which exists in the `test` folder, so check that out for a full example.

* Create a folder called `seeding` (feel free to use a different name) in your test folder
* Create your first seeding file in the folder, let's say organisation. So we now have `test/seeding/organisation.js`

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

*NOTE*: This file is important because the order that is defined in this file, defines the order of all the seeds to be ran.

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

Now we have to set everything up in your tests file. This is most likely the file where you define your global Mocha `before` and `after` hooks.

`setup.mocha.js`
```js
const colonize = require('colonize')
const pkg = require('./package')

const mongoUrl = 'mongodb://127.0.0.1:27017/${pkg.name}-test'

const colonization = colonize.initialize({
  mongoUrl,
  seedDirectory: path.resolve(__dirname, './test/seeding'),

  // Connection whitelist is important, it's a list of allowed connections (this is to double check we're not seeding / dropping a live database)
  connectionWhitelist: [
    mongoUrl
  ]
})

before(async () => {
  const { refs, stash } = await colonization.seed()

  global.stash = stash
  global.refs = refs
})

after(async () => {
  await colonization.close()
})
```

That's it, you're all setup.
