const express = require("express");
require("express-async-errors");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const rateLimiter = require("express-rate-limit");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const config = require("./utils/config");

const app = express();

mongoose.set("strictQuery", false);

logger.info("connecting to MongoDB", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB", error.message);
  });

const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
});

app.use(limiter);

app.use(express.static("build"));

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use("/api/blogs", middleware.userExtractor, blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line global-require
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
