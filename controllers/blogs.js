const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require("../models/user");

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  console.log(blogs)
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const user = await User.findOne({})

  const blog = new Blog({...request.body, user: user._id})

  const result = await blog.save()
  user.notes = user.notes.concat(result._id)
  await user.save()

  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    blog,
    {new: true, runValidators: true, context: 'query'}
  )
  response.json(updatedBlog)
})

module.exports = blogsRouter