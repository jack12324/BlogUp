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
  }, 10000
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
describe('adding a blog to the database', () => {
  test('succeeds with valid data', async () => {
    const blogsBefore = await helper.getBlogsInDB()

    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      url: "https://google.com/",
      likes: 2,
      comments: ['test comment 1', 'test comment 2']
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

  test('without the comments field set has it default to an empty array', async () => {

    const blogToAdd = {
      title: "Jack Test",
      author: "Jack Porter",
      url: "https://google.com/",
      likes: 2
    }

    const user = await User.findOne({})

   await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .send(blogToAdd)
      .expect(201)

    const addedBlog = await Blog.findOne({title: blogToAdd.title, author: blogToAdd.author, url: blogToAdd.url})

    expect(addedBlog.comments).toBeDefined()
    expect(addedBlog.comments).toHaveLength(0)
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
  test('fails with status 404 given a non-existing id', async () => {
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

  test('can update title, author, and url but can\'t update likes', async () => {
    const blogsBefore = await helper.getBlogsInDB()

    const blogToUpdate = blogsBefore[0]
    const updatedBlog = {...blogToUpdate, likes: blogToUpdate.likes + 8, title: 'new title', author: 'new author', url: 'new url'}

    const user  = await User.findOne({_id: blogToUpdate.user})

    const responseBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await helper.getBlogsInDB()
    const body = {...responseBlog.body, user: responseBlog.body.user.id}

    expect(blogsAfter).toContainEqual(body)
    expect(responseBlog.body.likes).toBe(blogToUpdate.likes)
    expect(responseBlog.body.likes).not.toBe(updatedBlog.likes)
    expect(responseBlog.body.title).toBe(updatedBlog.title)
    expect(responseBlog.body.author).toBe(updatedBlog.author)
    expect(responseBlog.body.url).toBe(updatedBlog.url)
  })
  test('fails with status 400 given an invalid id', async () => {
    const invalidId = 'aasdfasdem9'

    await api
      .put(`/api/blogs/${invalidId}`)
      .expect(400)
  })
  test('with a new comment succeeds', async () => {
    const blogsBefore = await helper.getBlogsInDB()

    const blogBefore = blogsBefore[0]
    const comment = 'A new test comment'

    const response = await api
      .post(`/api/blogs/${blogBefore.id}/comments`)
      .send({comment})
      .expect(200)
      .expect('Content-Type', /application\/json/)


    expect(response.body).toBe(comment)

    const blogsAfter = await helper.getBlogsInDB()
    const blogAfter = blogsAfter[0]

    expect(blogAfter.comments).toHaveLength(blogBefore.comments.length + 1)
    expect(blogAfter.comments).toContain(comment)
  })
  test('with a comment of invalid length returns 400 bad request and an error message', async () => {

    const blogsBefore = await helper.getBlogsInDB()
    const blogBefore = blogsBefore[0]
    const comment = 'a'

    const response = await api
      .post(`/api/blogs/${blogBefore.id}/comments`)
      .send({comment})
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('comment must be at least 5 characters')

  })
  test('with an existing comment returns 400 bad request and an error message', async () => {

    const blogsBefore = await helper.getBlogsInDB()
    const blogBefore = blogsBefore.filter(blog => blog.comments.length > 0)[0]
    const comment = blogBefore.comments[0]

    const response = await api
      .post(`/api/blogs/${blogBefore.id}/comments`)
      .send({comment})
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('comment must be unique')

  })
  test('with a whitespace comment returns 400 bad request and an error message', async () => {

    const blogsBefore = await helper.getBlogsInDB()
    const blogBefore = blogsBefore[1]
    const comment = '                  '

    const response = await api
      .post(`/api/blogs/${blogBefore.id}/comments`)
      .send({comment})
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('comment must be at least 5 characters')

  })

})
describe('liking a blog post', () =>{
  test('returns 404 if given non existing blog to like', async() => {
    const nonExistingId = await helper.getNonExistingId()
    const user  = await User.findOne({})

    const response = await api
      .post(`/api/blogs/${nonExistingId}/likes`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('blog does not exist')
  })
  test('returns 201 if the user has not liked the post previously and updates the corresponding blog and user accordingly', async () =>{
    const blogsBefore = await helper.getBlogsInDB()
    const blogToLike = blogsBefore[0]

    const user  = await User.findOne({})

    await api
      .post(`/api/blogs/${blogToLike.id}/likes`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(201)

    const blogsAfter = await helper.getBlogsInDB()
    const blogAfter = blogsAfter.find(blog=> blog.id === blogToLike.id)

    const userAfter  = await User.findOne({_id: user._id})

    expect(blogAfter.likes).toBe(blogToLike.likes + 1)
    expect(blogAfter.usersWhoLike).toContain(user._id.toString())

    expect(userAfter.likedBlogs.map(b => b.toString())).toContain(blogAfter.id)
    expect(userAfter.likedBlogs).toHaveLength(user.likedBlogs.length +1)

  })
  test('returns 401 if the request is made without a user logged in', async () => {

    const blog = await Blog.findOne({})
    const response = await api
      .post(`/api/blogs/${blog._id.toString()}/likes`)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('must be logged in to like a blog')
  })
  test('returns 400 if the user has already liked the post', async () => {

    const blogToLike = await Blog.findOne({})
    const user  = await User.findOne({})

    blogToLike.usersWhoLike = blogToLike.usersWhoLike.concat(user._id)
    await blogToLike.save()

    const response = await api
      .post(`/api/blogs/${blogToLike.id}/likes`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('user has already liked this blog')

  })
})
describe('unliking a blog post', () =>{
  test('returns 404 if given non existing blog to unlike', async() => {
    const nonExistingId = await helper.getNonExistingId()
    const user  = await User.findOne({})

    const response = await api
      .delete(`/api/blogs/${nonExistingId}/likes`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('blog does not exist')
  })
  test('returns 204 if the user has liked the post previously and updates the corresponding blog and user accordingly', async () =>{

    const blogToLike = await Blog.findOne({})
    const user  = await User.findOne({})

    blogToLike.usersWhoLike = blogToLike.usersWhoLike.concat(user._id)
    user.likedBlogs = user.likedBlogs.concat(blogToLike._id)

    await blogToLike.save()
    await user.save()

    await api
      .delete(`/api/blogs/${blogToLike.id}/likes`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(204)

    const blogsAfter = await helper.getBlogsInDB()
    const blogAfter = blogsAfter.find(blog=> blog.id === blogToLike.id)

    const userAfter  = await User.findOne({_id: user._id})

    expect(blogAfter.likes).toBe(blogToLike.likes - 1)
    expect(blogAfter.usersWhoLike).not.toContain(user._id.toString())
    expect(blogAfter.usersWhoLike).toHaveLength(blogToLike.usersWhoLike.length - 1)

    expect(userAfter.likedBlogs.map(b => b.toString())).not.toContain(blogAfter.id)
    expect(userAfter.likedBlogs).toHaveLength(user.likedBlogs.length - 1)

  })
  test('returns 401 if the request is made without a user logged in', async () => {

    const blog = await Blog.findOne({})
    const response = await api
      .delete(`/api/blogs/${blog._id.toString()}/likes`)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('must be logged in to unlike a blog')
  })
  test('returns 400 if the user has not already liked the post', async () => {

    const blogToLike = await Blog.findOne({})
    const user  = await User.findOne({})

    const response = await api
      .delete(`/api/blogs/${blogToLike.id}/likes`)
      .set('Authorization', `Bearer ${helper.getTokenForUser(user)}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('user has not liked this blog yet')

  })
})

})

afterAll ( async () => {
    await mongoose.connection.close()
  }
)