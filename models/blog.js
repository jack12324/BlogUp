const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    let transformObject = returnedObject
    transformObject.id = returnedObject._id.toString()
    delete transformObject._id
    delete transformObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)