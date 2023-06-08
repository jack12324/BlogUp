import { useSelector } from "react-redux";
import { Divider } from "@chakra-ui/react";
import BlogsHeading from "./BlogsHeading";
import BlogGrid from "./BlogGrid";

function MyBlogs() {
  const likedBlogs = useSelector((state) =>
    [
      ...state.blogs.filter((b) =>
        b.usersWhoLike.find((u) => u.username === state.currentUser.username)
      ),
    ].sort((a, b) => b.likes - a.likes)
  );
  const addedBlogs = useSelector((state) =>
    state.blogs.filter((b) => b.user.username === state.currentUser.username)
  );

  return (
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
  );
}

export default MyBlogs;
