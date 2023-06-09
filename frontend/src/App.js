import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { Box, Container, useTheme } from "@chakra-ui/react";
import { initializeBlogs } from "./reducer/blogReducer";
import { initializeCurrentUser } from "./reducer/currentUserReducer";
import { initializeUsers } from "./reducer/usersReducer";
import NavBar from "./components/NavBar";
import Home from "./components/Home";
import MyBlogs from "./components/MyBlogs";

function App() {
  const dispatch = useDispatch();
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
          <Route path="/myblogs" element={<MyBlogs />} />
          <Route path="/*" element={<Home />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
