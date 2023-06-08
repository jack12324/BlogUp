import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Navigate, Routes } from "react-router-dom";
import { Box, Container, useTheme } from "@chakra-ui/react";
import { initializeBlogs } from "./reducer/blogReducer";
import { initializeCurrentUser } from "./reducer/currentUserReducer";
import { initializeUsers } from "./reducer/usersReducer";
import NavBar from "./components/NavBar";
import Home from "./components/Home";
import MyBlogs from "./components/MyBlogs";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUser);
  const theme = useTheme();

  useEffect(() => {
    dispatch(initializeBlogs());
  }, []);

  useEffect(() => {
    dispatch(initializeCurrentUser());
  }, []);

  useEffect(() => {
    dispatch(initializeUsers());
  }, []);

  const requireLogin = (element) => {
    if (user) {
      return element;
    }
    return <Navigate replace to="/" />;
  };

  return (
    <Box
      as="section"
      pb={{
        base: "12",
        md: "24",
      }}
    >
      <Container w={{ xl: theme.breakpoints.xl }} maxW="100%">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/myblogs" element={requireLogin(<MyBlogs />)} />
          <Route path="/*" element={<Home />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
