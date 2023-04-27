const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

describe('When are users in the db', () => {

  beforeEach(async () => {

    await User.deleteMany({})

    const addNewUser = async user => {
      const passwordHash = await bcrypt.hash(user.password, 10)
      const userToAdd = new User({
        username: user.username,
        name: user.name,
        passwordHash: passwordHash
      })
      await userToAdd.save()
    }

    const userPromises = helper.initialUsers.map(user => addNewUser(user))
    await Promise.all(userPromises)
  })

  describe('attempting to log in', () => {
    test('with valid data succeeds with 200 and returns a token', async () => {
      const loginUser = {
        username: helper.initialUsers[0].username,
        password: helper.initialUsers[0].password
      }

      const token = await api
        .post('/api/login')
        .send(loginUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const user = await User.findOne({username: loginUser.username})

      expect(token.body.username).toBe(loginUser.username)
      expect(token.body.name).toBe(user.name)
      expect(token.body.token).toBeDefined()

    })


    test('with wrong username fails with status 401 and returns an error message', async () => {
      const loginUser = {
        username: 'some guy',
        password: 'wrong'
      }

      const response = await api
        .post('/api/login')
        .send(loginUser)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(response.body.error).toContain('invalid username or password')
    })
    test('with wrong password fails with status 401 and returns an error message', async () => {
      const loginUser = {
        username: helper.initialUsers[0].username,
        password: 'wrong'
      }

      const response = await api
        .post('/api/login')
        .send(loginUser)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(response.body.error).toContain('invalid username or password')
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})