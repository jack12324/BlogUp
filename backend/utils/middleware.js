const jwt = require("jsonwebtoken");
const logger = require("./logger");
const User = require("../models/user");
const Blog = require("../models/blog");

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    response.status(400).send({ error: "malformed id" });
    return;
  }
  if (error.name === "ValidationError") {
    response.status(400).send({ error: error.message });
    return;
  }
  if (error.name === "JsonWebTokenError") {
    response.status(400).json({ error: error.message });
    return;
  }
  if (error.name === "TokenExpiredError") {
    response.status(401).json({ error: "token expired" });
    return;
  }

  next(error);
};

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  // pull password out of body before logging
  if (request.body.password) {
    const { password, ...rest } = request.body;
    logger.info("Body:  ", rest);
  } else {
    logger.info("Body:  ", request.body);
  }
  logger.info("---");
  next();
};

const tokenExtractor = (request, response, next) => {
  const auth = request.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) {
    request.token = auth.replace("Bearer ", "");
  }
  next();
};
const userExtractor = async (request, response, next) => {
  if (request.token) {
    const token = jwt.verify(request.token, process.env.SECRET);
    if (token) {
      request.user = await User.findById(token.id);
    }
  }
  next();
};

const blogExtractor = async (request, response, next) => {
  const blog = await Blog.findById(request.params.id);
  if (!blog) {
    response.status(404).json({ error: "blog does not exist on server" });
    return;
  }
  request.blog = blog;
  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  requestLogger,
  tokenExtractor,
  userExtractor,
  blogExtractor,
};
