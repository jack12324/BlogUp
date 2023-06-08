import { createSlice } from "@reduxjs/toolkit";
import blogService from "../services/blogs";
import { errorToast, successToast } from "../components/Toasts";

const blogSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      return action.payload;
    },
    appendBlog(state, action) {
      state.push(action.payload);
    },
    removeBlog(state, action) {
      return state.filter((blog) => blog.id !== action.payload.id);
    },
    updateBlog(state, action) {
      return state.map((blog) =>
        blog.id === action.payload.id ? action.payload : blog
      );
    },
  },
});

export default blogSlice.reducer;

export const { setBlogs, appendBlog, removeBlog, updateBlog } =
  blogSlice.actions;

export const initializeBlogs = () => async (dispatch) => {
  const blogs = await blogService.getAll();
  dispatch(setBlogs(blogs));
};

const isTokenError = (msg) => msg.includes("token expired");
const notifyTokenError = () => {
  errorToast("Your session has expired, please log in again");
};

export const createBlog = (blog, user) => async (dispatch) => {
  try {
    const newBlog = await blogService.create(blog);
    dispatch(appendBlog({ ...newBlog, user }));
    successToast(`Added ${newBlog.title} by ${newBlog.author}`);
    return null;
  } catch (err) {
    const msg = err.response?.data?.error;
    if (msg) {
      if (isTokenError(msg)) {
        return "Your session has expired, please log in again";
      }
      return msg;
    }
    return "Adding Blog Failed";
  }
};

export const deleteBlog = (blog) => async (dispatch) => {
  try {
    dispatch(removeBlog(blog));
    await blogService.deleteBlog(blog.id);
    successToast(`Deleted ${blog.title} by ${blog.author}`);
  } catch (err) {
    dispatch(appendBlog(blog));
    const msg = err.response?.data?.error;
    if (msg) {
      if (isTokenError(msg)) {
        notifyTokenError();
        return;
      }
    }
    errorToast(`Deleting ${blog.title} by ${blog.author} failed`);
  }
};

export const unLikeBlog = (blog, user) => async (dispatch) => {
  try {
    const updatedBlog = {
      ...blog,
      likes: blog.likes - 1,
      usersWhoLike: blog.usersWhoLike.filter((b) => b.id !== user.id),
    };
    dispatch(updateBlog(updatedBlog));
    await blogService.unLikeBlog(blog.id);
  } catch (err) {
    dispatch(updateBlog(blog));
    const msg = err.response?.data?.error;
    if (msg) {
      if (isTokenError(msg)) {
        notifyTokenError();
        return;
      }
    }
    errorToast("Unliking blog failed");
  }
};
export const likeBlog = (blog, user) => async (dispatch) => {
  try {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      usersWhoLike: blog.usersWhoLike.concat({
        id: user.id,
        name: user.name,
        username: user.username,
      }),
    };
    dispatch(updateBlog(updatedBlog));
    await blogService.likeBlog(blog.id);
  } catch (err) {
    dispatch(updateBlog(blog));
    const msg = err.response?.data?.error;
    if (msg) {
      if (isTokenError(msg)) {
        notifyTokenError();
        return;
      }
    }
    errorToast("Liking blog failed");
  }
};

export const addCommentToBlog = (blog, comment) => async (dispatch) => {
  try {
    const addedComment = await blogService.addCommentToBlog(blog.id, comment);
    dispatch(
      updateBlog({ ...blog, comments: blog.comments.concat(addedComment) })
    );
  } catch (err) {
    let errMessage = "Adding comment failed";
    const msg = err.response.data.error;
    if (msg && msg.includes("comments:")) {
      errMessage = `${errMessage}: ${msg.slice(msg.indexOf("comments:") + 10)}`;
    }
    errorToast(errMessage);
  }
};
