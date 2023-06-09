import { useSelector } from "react-redux";
import BlogsHeading from "./BlogsHeading";
import BlogGrid from "./BlogGrid";
import { useCsrBreakpointValue } from "../hooks";

function Home() {
  const blogs = useSelector((state) =>
    [...state.blogs].sort((a, b) => b.likes - a.likes)
  );

  const isBase = useCsrBreakpointValue({ base: true, sm: false });
  return (
    <section>
      {isBase ? null : (
        <BlogsHeading msg="Blogs to Enrich Your Life" highlightWord="Enrich" />
      )}
      <BlogGrid blogs={blogs} />
    </section>
  );
}

export default Home;
