/* eslint-disable no-console */
const override = false;
const info = (...params) => {
  if (process.env.NODE_ENV !== "test" || override) {
    console.log(...params);
  }
};

const error = (...params) => {
  if (process.env.NODE_ENV !== "test" || override) {
    console.error(...params);
  }
};

module.exports = {
  info,
  error,
};
