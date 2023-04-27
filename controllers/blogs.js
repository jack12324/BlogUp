const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require("../models/user");
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const auth = request.get('Authorization')
  if(auth && auth.startsWith('Bearer ')){
    const temp = auth.replace('Bearer ', '')
    return(temp)
  }
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const {title, author, url, likes} = request.body
  const token = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if(!token){
    return response.status(401).json({error: 'token invalid'})
  }

  const user = await User.findById(token.id)

  const blog = new Blog({
    title: title,
    author: author,
    url: url,
    likes: likes,
    user: user._id
  })

  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
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