import { useSelector } from "react-redux";
import { Divider } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BlogsHeading from "./BlogsHeading";
import BlogGrid from "./BlogGrid";

function MyBlogs() {
  const likedBlogs = useSelector((state) =>
    [
      ...state.blogs.filter((b) =>
        b.usersWhoLike.find((u) => u.username === state.currentUser?.username)
      ),
    ].sort((a, b) => b.likes - a.likes)
  );
  const addedBlogs = useSelector((state) =>
    state.blogs.filter((b) => b.user.username === state.currentUser?.username)
  );

  // This is a tricky way to fix an issue with the routing
  // previously, on load user would not be initialized yet, so the page would
  // always be redirected to home on a reload. Here, we initialize user to "loading".
  // if user is loading we return null instead of redirecting. Once the state has been
  // retrieved from the redux store via UseSelector, the useEffect hook updates the user
  // state with that value. user is no longer loading, so the page now either correctly
  // redirects or loads the user's blogs
  const [user, setUser] = useState("loading");
  const currentUser = useSelector((state) => state.currentUser);
  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);
  if (user === "loading") return null;

  return user ? (
    <>
      <section>
        <BlogsHeading msg="Blogs You've Added" highlightWord="Added" />
        <BlogGrid blogs={addedBlogs} add />
      </section>
      <Divider pt="2" />
      <section>
        <BlogsHeading
          msg="Blogs You Like"
          highlightWord="Like"
          highlightStyle={{ color: "pink.400" }}
        />
        <BlogGrid blogs={likedBlogs} />
      </section>
    </>
  ) : (
    <Navigate to="/" />
  );
}

export default MyBlogs;
