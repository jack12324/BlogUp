const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

describe('When there initially some users in db', () => {

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

  test('getting all users succeeds with status 200', async () => {
    const users = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(users.body).toHaveLength(helper.initialUsers.length)
  })

  describe('creating a user', () => {
    test('succeeds with valid data', async () => {
      const usersBefore = await helper.getUsersInDB()

      const userToAdd = {
        username: 'jp123',
        name: 'jack',
        password: 'test'
      }

      await api
        .post('/api/users')
        .send(userToAdd)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAfter = await helper.getUsersInDB()
      expect(usersAfter).toHaveLength(usersBefore.length + 1)
      expect(usersAfter.map(user => user.username)).toContain(userToAdd.username)
    })

    test('does not store the password as a password hast which isn\'t the plain text password', async () => {

      const userToAdd = {
        username: 'jp123',
        name: 'jack',
        password: 'test'
      }

      await api
        .post('/api/users')
        .send(userToAdd)
        .expect(201)
        .expect('Content-Type', /application\/json/)


      const username = userToAdd.username
      const addedUser = await User.findOne({username})

      expect(addedUser.passwordHash).toBeDefined()
      expect(addedUser.password).not.toBeDefined()
      expect(addedUser.passwordHash).not.toBe(userToAdd.password)
    })


    test('fails with 400 if missing username and returns error message', async () => {
      const usersBefore = await helper.getUsersInDB()

      const userToAdd = {
        name: 'jack',
        password: 'test'
      }

      const response = await api
        .post('/api/users')
        .send(userToAdd)
        .expect(400)

      const usersAfter = await helper.getUsersInDB()
      expect(usersAfter).toEqual(usersBefore)
      expect(response.body.error).toContain('`username` is required')
    })

    test('fails with 400 if missing password and returns error message', async () => {
      const usersBefore = await helper.getUsersInDB()

      const userToAdd = {
        username: 'jp123',
        name: 'jack',
      }

      const response = await api
        .post('/api/users')
        .send(userToAdd)
        .expect(400)

      const usersAfter = await helper.getUsersInDB()
      expect(usersAfter).toEqual(usersBefore)
      expect(response.body.error).toContain('password is required')
    })

    test('fails with 400 if password is too short and returns error message', async () => {
      const usersBefore = await helper.getUsersInDB()

      const userToAdd = {
        username: 'jp123',
        name: 'jack',
        password: '11'
      }

      const response = await api
        .post('/api/users')
        .send(userToAdd)
        .expect(400)

      const usersAfter = await helper.getUsersInDB()
      expect(usersAfter).toEqual(usersBefore)
      expect(response.body.error).toContain('password must be at least 3 characters')
    })

    test('fails with 400 if username is too short and returns error message', async () => {
      const usersBefore = await helper.getUsersInDB()

      const userToAdd = {
        username: 'jp',
        name: 'jack',
        password: '11asl;kdjf'
      }

      const response = await api
        .post('/api/users')
        .send(userToAdd)
        .expect(400)

      const usersAfter = await helper.getUsersInDB()
      expect(usersAfter).toEqual(usersBefore)
      expect(response.body.error).toContain('is shorter than the minimum allowed length')
    })

    test('fails with 400 if username is not unique and returns error message', async () => {
      const usersBefore = await helper.getUsersInDB()

      const userToAdd = {
        username: helper.initialUsers[0].username,
        name: 'jack',
        password: '11asl;kdjf'
      }

      const response = await api
        .post('/api/users')
        .send(userToAdd)
        .expect(400)

      const usersAfter = await helper.getUsersInDB()
      expect(usersAfter).toEqual(usersBefore)
      expect(response.body.error).toContain('expected `username` to be unique')
    })
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})