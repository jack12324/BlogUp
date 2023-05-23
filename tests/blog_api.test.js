const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')
const User = require("../models/user");
const bcrypt = require("bcrypt");

beforeEach(
  async () => {

    const loadBlogs = async () => {
      await Blog.deleteMany({})
      const user = await User.findOne({})
      const blogs = helper.initialBlogs.map(blog => new Blog({...blog, user: user._id}))
      const blogIds = blogs.map(blog => blog._id)
      const blogPromises = blogs.map(blog => blog.save())

      const userPromise = user.updateOne({blogs: blogIds})
      await Promise.all(blogPromises.concat(userPromise))
    }
    const loadUsers = async () => {
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
    }

    // must load users first so blogs can get a user
    await loadUsers()
    await loadBlogs()
  }
)

describe('when some blogs already exist', () => {
  test('get returns Status 200 with all blogs returned as json', async () => {
    const blogs =
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(blogs.body).toHaveLength(helper.initialBlogs.length)
  })
  test('the unique identifier property of a blog post is named id', async () => {
    const blogs = await helper.getBlogsInDB()
    expect(blogs[0].id).toBeDefined()
  })
})

describe('adding a blog to the database', () => {
  test('succeeds with valid data', async () => {
    const blogsBefore = await helper.getBlogsInDB()

    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      url: "https://google.com/",
      likes: 2
    }

    const user = await User.findOne({})

    const addedBlog = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .send(blogToAdd)
      .expect(201)

    const blogsAfter = await helper.getBlogsInDB()

    expect(blogsAfter).toHaveLength(blogsBefore.length + 1)
    expect(blogsAfter).toContainEqual(addedBlog.body)
    expect(addedBlog.body.user).toBe(user._id.toString())
  })


  test('without the likes field set has it default to 0', async () => {

    const user = await User.findOne({})
    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      url: "https://google.com/"
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .send(blogToAdd)
      .expect(201)

    const addedBlog = await Blog.findOne({title: blogToAdd.title, author: blogToAdd.author, url: blogToAdd.url})

    expect(addedBlog.likes).toBe(0)

  })

  test('without a title returns 400 bad request', async () => {

    const blogsBefore = await helper.getBlogsInDB()
    const user = await User.findOne({})
    const blogToAdd = {
      author: "Jack Porter",
      url: "https://google.com/",
      likes: 4
    }


    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .send(blogToAdd)
      .expect(400)

    const blogsAfter = await helper.getBlogsInDB()

    expect(blogsAfter).toHaveLength(blogsBefore.length)
  })


  test('without a url returns 400 bad request', async () => {

    const blogsBefore = await helper.getBlogsInDB()
    const user = await User.findOne({})

    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      likes: 4
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .send(blogToAdd)
      .expect(400)

    const blogsAfter = await helper.getBlogsInDB()

    expect(blogsAfter).toHaveLength(blogsBefore.length)
  })

  test('without a token returns status 401', async () => {
    const blogsBefore = await helper.getBlogsInDB()

    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      url: "https://google.com/",
      likes: 2
    }

    const response = await api
      .post('/api/blogs')
      .send(blogToAdd)
      .expect(401)

    const blogsAfter = await helper.getBlogsInDB()
    expect(blogsAfter).toEqual(blogsBefore)
    expect(response.body.error).toContain('invalid credentials to add blog')
  })

  test('with an invalid token returns status 400, invalid token', async () => {
    const blogsBefore = await helper.getBlogsInDB()

    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      url: "https://google.com/",
      likes: 2
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer lkj.sdflk.jsldkfj`)
      .send(blogToAdd)
      .expect(400)

    const blogsAfter = await helper.getBlogsInDB()
    expect(blogsAfter).toEqual(blogsBefore)
    expect(response.body.error).toContain('invalid token')
  })

  test('without a authorization header returns 401', async () => {
    const blogsBefore = await helper.getBlogsInDB()

    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      url: "https://google.com/",
      likes: 2
    }

    await api
      .post('/api/blogs')
      .send(blogToAdd)
      .expect(401)

    const blogsAfter = await helper.getBlogsInDB()
    expect(blogsAfter).toEqual(blogsBefore)
  })
})

describe('deleting a blog from the database', () => {
  test('succeeds with status 204 given a valid and existing id and token', async () => {
    const blogsBefore = await helper.getBlogsInDB()
    const blogToDelete = blogsBefore[0]

    const user  = await User.findOne({_id: blogToDelete.user})

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(204)

    const blogsAfter = await helper.getBlogsInDB()
    const blogIds = blogsAfter.map(blog => blog.id)

    expect(blogsAfter).toHaveLength(blogsBefore.length - 1)
    expect(blogIds).not.toContain(blogToDelete.id)
  })

  test('removes it from it\'s user', async () => {

    const blogsBefore = await helper.getBlogsInDB()
    const blogToDelete = blogsBefore[0]

    const user  = await User.findOne({_id: blogToDelete.user})

    expect(user.blogs.map(blog => blog.toString())).toContain(blogToDelete.id)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(204)

    const blogsAfter = await helper.getBlogsInDB()
    const blogIds = blogsAfter.map(blog => blog.id)
    const userAfter  = await User.findOne({_id: blogToDelete.user})

    expect(blogsAfter).toHaveLength(blogsBefore.length - 1)
    expect(blogIds).not.toContain(blogToDelete.id)

    expect(userAfter.blogs.map(blog => blog.toString())).not.toContain(blogToDelete.id)
  })

  test('fails with 401 and error message given the wrong user token', async () => {
    const blogsBefore = await helper.getBlogsInDB()
    const blogToDelete = blogsBefore[0]

    const user  = await User.findOne({}).where('_id').ne(blogToDelete.user)

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(401)

    const blogsAfter = await helper.getBlogsInDB()

    expect(blogsAfter).toEqual(blogsBefore)
    expect(response.body.error).toContain('invalid credentials to delete blog')
  })

  test('fails with 401 and error message given no token', async () => {
    const blogsBefore = await helper.getBlogsInDB()
    const blogToDelete = blogsBefore[0]

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAfter = await helper.getBlogsInDB()

    expect(blogsAfter).toEqual(blogsBefore)
    expect(response.body.error).toContain('invalid credentials to delete blog')
  })

  test('succeeds with status 404 given a non-existing id', async () => {
    const nonExistingId = await helper.getNonExistingId()
    const user  = await User.findOne({})

    const response = await api
      .delete(`/api/blogs/${nonExistingId}`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('blog does not exist on server')
  })
  test('fails with status 400 given an invalid id', async () => {
    const invalidId = 'aasdfasdem9'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})


describe('updating a blog post', () => {

  test('succeeds with status 200 for valid data', async () => {
    const blogsBefore = await helper.getBlogsInDB()

    const blogToUpdate = blogsBefore[0]
    const updatedBlog = {...blogToUpdate, likes: blogToUpdate.likes + 8}

    const responseBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await helper.getBlogsInDB()


    const body = {...responseBlog.body, user: responseBlog.body.user.id}

    expect(blogsAfter).toContainEqual(body)
    expect(responseBlog.body.likes).toBe(updatedBlog.likes)
    expect(responseBlog.body.likes).not.toBe(blogToUpdate.likes)
  })

  test('fails with status 400 given an invalid id', async () => {
    const invalidId = 'aasdfasdem9'

    await api
      .put(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})


afterAll ( async () => {
    await mongoose.connection.close()
  }
)