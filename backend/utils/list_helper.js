const _ = require("lodash");

const dummy = () => 1;

const totalLikes = (blogList) =>
  blogList.reduce((previous, current) => previous + current.likes, 0);

const favoriteBlog = (blogList) =>
  blogList.reduce(
    (topBlog, blog) => (topBlog.likes > blog.likes ? topBlog : blog),
    NaN
  );

const mostLikes = (bloglist) => {
  if (bloglist.length === 0) return NaN;

  const BlogListByAuthor = _.toPairs(_.groupBy(bloglist, "author")).map(
    (authorItem) => ({
      author: authorItem[0],
      likes: _.sumBy(authorItem[1], (blog) => blog.likes),
    })
  );

  return _.sortBy(
    BlogListByAuthor,
    (authorBlogs) => authorBlogs.likes
  ).reverse()[0];
};

const mostBlogs = (bloglist) => {
  if (bloglist.length === 0) return NaN;

  const topAuthor = _.sortBy(
    _.toPairs(_.countBy(bloglist, "author")),
    (author) => author[1]
  ).reverse()[0];

  return {
    author: topAuthor[0],
    blogs: topAuthor[1],
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
