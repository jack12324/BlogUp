import { createSlice } from "@reduxjs/toolkit";
import usersService from "../services/users";
import { successToast } from "../components/Toasts";

const usersSlice = createSlice({
  name: "users",
  initialState: [],
  reducers: {
    setUsers(state, action) {
      return action.payload;
    },
    appendUser(state, action) {
      state.push(action.payload);
    },
  },
});

export const { setUsers, appendUser } = usersSlice.actions;

export const initializeUsers = () => async (dispatch) => {
  const users = await usersService.getAll();
  dispatch(setUsers(users));
};

export const signUp = (user) => async (dispatch) => {
  try {
    const newUser = await usersService.create(user);
    dispatch(appendUser(newUser));
    successToast("Sign Up Successful! You may Log In now");
    return "";
  } catch (err) {
    const msg = err.response?.data?.error;
    return msg ?? "Sign up failed";
  }
};
export default usersSlice.reducer;
