const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs').populate('likedBlogs')
  response.status(200).json(users)
})
usersRouter.post('/', async (request, response) => {
  const {password, username, name} = request.body

  if(!password){
    return response.status(400).json({error: 'password is required'})
  }
  if(password.length < 4){
    return response.status(400).json({error: 'password must be at least 4 characters'})
  }

  const numSalts = 10
  const passwordHash = await bcrypt.hash(password, numSalts)

  const userToAdd = new User({
    passwordHash: passwordHash,
    username: username,
    name: name ? name : username,
  })

  const savedUser = await userToAdd.save()
  response.status(201).json(savedUser)

})

module.exports = usersRouter