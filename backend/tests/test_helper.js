const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require("jsonwebtoken");

const initialBlogs = [
  {
    id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    comments: ['an existing comment']
  },
  {
    id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12
  },
  {
    id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10
  },
  {
    id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0
  },
  {
    id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2
  }
]

const initialUsers = [
  {
    username: "willy",
    name: 'free willy',
    password: 'free me'
  },
  {
    username: "joe",
    name: 'joe camel',
    password: 'smoke me'
  }
]

const getBlogsInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON()).map(blog => ({
    ...blog,
    user: blog.user.toString(),
    usersWhoLike: blog.usersWhoLike.map(u => u.toString())
  }))
}
const getUsersInDB = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
};

const getNonExistingId = async () => {

  const user = await User.findOne({})

  const blog = new Blog({
    title: "temp",
    author: "temp author",
    url: "http://temp.com",
    likes: 0,
    user: user._id
  })


  await blog.save()
  await blog.deleteOne()
  return blog.toJSON().id
}

const getTokenForUser = user => {

  const userForToken = {
    username:  user.username,
    id: user._id
  }
  return jwt.sign(userForToken, process.env.SECRET)
}

module.exports = {
  initialBlogs,
  initialUsers,
  getBlogsInDB,
  getNonExistingId,
  getUsersInDB,
  getTokenForUser
}