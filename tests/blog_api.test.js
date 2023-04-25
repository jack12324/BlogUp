const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')
const util = require("util");

beforeEach(
  async () => {
    await Blog.deleteMany({})
    const blogs = helper.initialBlogs.map(blog => new Blog(blog))
    const blogPromises = blogs.map(blog => blog.save())
    await Promise.all(blogPromises)
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

    await api
      .post('/api/blogs')
      .send(blogToAdd)
      .expect(201)

    const blogsAfter = await helper.getBlogsInDB()

    const blogContents = blogsAfter.map(({id, ...blogNoId}) => blogNoId)

    expect(blogsAfter).toHaveLength(blogsBefore.length + 1)
    expect(blogContents).toContainEqual(blogToAdd)
  })

  test('without the likes field set has it default to 0', async () => {

    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      url: "https://google.com/"
    }

    await api
      .post('/api/blogs')
      .send(blogToAdd)
      .expect(201)

    const blogsAfter = await helper.getBlogsInDB()
    const addedBlog = blogsAfter.find(({likes, id, ...setProperties}) => util.isDeepStrictEqual(setProperties, blogToAdd))

    expect(addedBlog.likes).toBe(0)

  })

  test('without a title returns 400 bad request', async () => {

    const blogsBefore = await helper.getBlogsInDB()

    const blogToAdd = {
      author: "Jack Porter",
      url: "https://google.com/",
      likes: 4
    }

    await api
      .post('/api/blogs')
      .send(blogToAdd)
      .expect(400)

    const blogsAfter = await helper.getBlogsInDB()

    expect(blogsAfter).toHaveLength(blogsBefore.length)
  })


  test('without a url returns 400 bad request', async () => {

    const blogsBefore = await helper.getBlogsInDB()

    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      likes: 4
    }

    await api
      .post('/api/blogs')
      .send(blogToAdd)
      .expect(400)

    const blogsAfter = await helper.getBlogsInDB()

    expect(blogsAfter).toHaveLength(blogsBefore.length)
  })

})

describe('deleting a blog from the database', () => {
  test('succeeds with status 204 given a valid and existing id', async () => {
    const blogsBefore = await helper.getBlogsInDB()
    const blogToDelete = blogsBefore[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAfter = await helper.getBlogsInDB()
    const blogIds = blogsAfter.map(blog => blog.id)

    expect(blogsAfter).toHaveLength(blogsBefore.length - 1)
    expect(blogIds).not.toContain(blogToDelete.id)
  })

  test('succeeds with status 204 given a non-existing id', async () => {
    const nonExistingId = await helper.getNonExistingId()

    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .expect(204)
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

    expect(blogsAfter).toContainEqual(responseBlog.body)
    expect(responseBlog.body.likes).toBe(updatedBlog.likes)
    expect(responseBlog.body.likes).not.toBe(blogToUpdate.likes)
  })

  //test('fails with status 404 given a non-existing id', async () => {
  //  const nonExistingId = await helper.getNonExistingId()

  //  const response = await api
  //    .put(`/api/blogs/${nonExistingId}`)
  //    .send({})
  //  console.log(response.body)
  //})
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