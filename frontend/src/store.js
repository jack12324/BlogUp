import { configureStore } from "@reduxjs/toolkit";
import blogReducer from "./reducer/blogReducer";
import currentUserReducer from "./reducer/currentUserReducer";
import usersReducer from "./reducer/usersReducer";

const store = configureStore({
  reducer: {
    blogs: blogReducer,
    currentUser: currentUserReducer,
    users: usersReducer,
  },
});

export default store;
