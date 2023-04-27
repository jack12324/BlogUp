const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const {title, author, url, likes} = request.body

  const user = request.user
  if(!user){
    response.status(401).json({error:'invalid credentials to add blog'})
  }

  const blog = new Blog({
    title: title,
    author: author,
    url: url,
    likes: likes,
    user: request.user._id
  })

  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()

  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {

  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if(!blog){
    return response.status(404).json({error: 'blog does not exist on server'})
  }

  if(!user || (blog.user.toString() !== user.id.toString())) {
    return response.status(401).json({error: 'invalid credentials to delete blog'})
  }
  await blog.deleteOne()
  const updatedBlogs = user.blogs.filter(ub => ub.toString() !== blog._id.toString())
  await user.updateOne({blogs: updatedBlogs})

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