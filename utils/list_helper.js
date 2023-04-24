const _ = require('lodash')
const dummy = () => {
  return 1
}

const totalLikes = blogList => {
  return blogList.reduce( ((previous, current) => (previous + current.likes)), 0)
}

const favoriteBlog = blogList => {
  return blogList.reduce((topBlog, blog) => (topBlog.likes > blog.likes ? topBlog : blog), NaN)
}

const mostLikes= bloglist => {

  if(bloglist.length === 0) return NaN

  const blog_list_grouped_by_authors =
    _.toPairs(_.groupBy(bloglist, 'author'))
      .map( authorItem => (
        {
          author: authorItem[0],
          likes: _.sumBy(authorItem[1], blog => blog.likes)
        }
      ))

  return _.sortBy( blog_list_grouped_by_authors, authorBlogs => authorBlogs.likes).reverse()[0]

}

const mostBlogs = bloglist => {

  if(bloglist.length === 0) return NaN

  const top_author = _.sortBy(_.toPairs(_.countBy(bloglist, 'author')), author => author[1]).reverse()[0]

  return {
    author: top_author[0],
    blogs: top_author[1]
  }

}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}