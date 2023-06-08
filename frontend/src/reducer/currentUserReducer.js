import { createSlice } from "@reduxjs/toolkit";
import blogService from "../services/blogs";
import loginService from "../services/login";
import { successToast } from "../components/Toasts";

const LSUSERKEY = "blogListAppLoggedInUser";

const currentUserSlice = createSlice({
  name: "currentUser",
  initialState: null,
  reducers: {
    setCurrentUser(state, action) {
      return action.payload;
    },
    clearCurrentUser() {
      return null;
    },
  },
});

export const { setCurrentUser, clearCurrentUser } = currentUserSlice.actions;

export const initializeCurrentUser = () => async (dispatch) => {
  const localUser = localStorage.getItem(LSUSERKEY);
  if (localUser) {
    const currentUser = JSON.parse(localUser);
    dispatch(setCurrentUser(currentUser));
    blogService.setToken(currentUser.token);
  }
};

export const loginUser = (user) => async (dispatch) => {
  try {
    const currentUser = await loginService.login(user);
    blogService.setToken(currentUser.token);
    localStorage.setItem(LSUSERKEY, JSON.stringify(currentUser));
    dispatch(setCurrentUser(currentUser));
    successToast("Login Successful");
    return null;
  } catch (err) {
    const msg = err.response?.data?.error;
    if (msg) {
      return msg;
    }
    return "Log in Failed";
  }
};

export const logout = () => async (dispatch) => {
  dispatch(clearCurrentUser());
  blogService.setToken(null);
  localStorage.removeItem(LSUSERKEY);
  successToast("Logout Successful");
};
export default currentUserSlice.reducer;
