const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: String,
  url: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  usersWhoLike: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: {
    type: [String],
    default: [],
    validate: [
      {validator: validateCommentLengths, msg: 'comment must be at least 5 characters'},
      {validator: validateUniqueComment, msg: 'comment must be unique'}
    ]
  }
})

function validateCommentLengths (comments) {
  for(comment of comments){
    if (comment.length < 5) {
      return false
    }
  }
  return true
}

function validateUniqueComment (comments)  {
  return new Set(comments).size === comments.length
}

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    let transformObject = returnedObject
    transformObject.id = returnedObject._id.toString()
    delete transformObject._id
    delete transformObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)