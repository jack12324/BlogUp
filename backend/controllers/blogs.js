const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const { blogExtractor } = require("../utils/middleware");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({})
    .populate("user", { username: 1, name: 1 })
    .populate("usersWhoLike", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;

  const { user } = request;
  if (!user) {
    response.status(401).json({ error: "invalid credentials to add blog" });
    return;
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id,
  });

  const result = await blog.save();
  user.blogs = user.blogs.concat(result._id);
  await user.save();

  response.status(201).json(result);
});

blogsRouter.delete("/:id", blogExtractor, async (request, response) => {
  const { user } = request;
  const { blog } = request;

  if (!user || blog.user.toString() !== user.id.toString()) {
    response.status(401).json({ error: "invalid credentials to delete blog" });
    return;
  }
  await blog.deleteOne();
  const updatedBlogs = user.blogs.filter(
    (ub) => ub.toString() !== blog._id.toString()
  );
  await user.updateOne({ blogs: updatedBlogs });

  response.status(204).end();
});

blogsRouter.put("/:id", blogExtractor, async (request, response) => {
  const blog = { ...request.body };

  // prevent updating likes
  const newBlog = {
    ...blog,
    likes: request.blog.likes,
    user: request.blog.user._id,
  };

  if (
    !request.user ||
    request.blog.user.toString() !== request.user.id.toString()
  ) {
    response.status(401).json({ error: "invalid credentials to edit blog" });
    return;
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, newBlog, {
    new: true,
    runValidators: true,
    context: "query",
  }).populate("user", { username: 1, name: 1 });
  response.json(updatedBlog);
});

blogsRouter.post("/:id/comments", blogExtractor, async (request, response) => {
  const { comment } = request.body;
  const { blog } = request;

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { comments: blog.comments.concat(comment.trim()) },
    { new: true, runValidators: true, context: "query" }
  );
  response.json(updatedBlog.comments.slice(-1)[0]);
});

blogsRouter.post("/:id/likes", blogExtractor, async (request, response) => {
  const { user } = request;
  const { blog } = request;

  if (!user) {
    response.status(401).json({ error: "must be logged in to like a blog" });
    return;
  }

  if (blog.usersWhoLike.find((u) => u.toString() === user._id.toString())) {
    response.status(400).json({ error: "user has already liked this blog" });
    return;
  }

  blog.likes += 1;
  blog.usersWhoLike = blog.usersWhoLike.concat(user._id);
  user.likedBlogs = user.likedBlogs.concat(blog._id);

  await user.save();
  await blog.save();

  response.status(201).end();
});

blogsRouter.delete("/:id/likes", blogExtractor, async (request, response) => {
  const { user } = request;
  const { blog } = request;

  if (!user) {
    response.status(401).json({ error: "must be logged in to unlike a blog" });
    return;
  }

  if (!blog.usersWhoLike.find((u) => u.toString() === user._id.toString())) {
    response.status(400).json({
      error: "user has not liked this blog yet, so it is impossible to unlike",
    });
    return;
  }

  blog.likes -= 1;
  blog.usersWhoLike = blog.usersWhoLike.filter(
    (u) => u.toString() !== user._id.toString()
  );
  user.likedBlogs = user.likedBlogs.filter(
    (b) => b.toString() !== blog._id.toString()
  );

  await user.save();
  await blog.save();

  response.status(204).end();
});

module.exports = blogsRouter;
