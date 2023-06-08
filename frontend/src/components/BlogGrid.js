import { Box, SimpleGrid } from "@chakra-ui/react";
import PropTypes from "prop-types";
import BlogCard from "./BlogCard";
import AddBlogCard from "./AddBlogCard";

function BlogGrid({ blogs, add }) {
  return (
    <Box as="section" py="4">
      <SimpleGrid
        minChildWidth="300px"
        spacingX="15px"
        spacingY={{ base: "50px", md: "20px" }}
      >
        {add ? <AddBlogCard /> : null}
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </SimpleGrid>
    </Box>
  );
}

BlogGrid.propTypes = {
  blogs: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      author: PropTypes.string,
      url: PropTypes.string,
      user: PropTypes.shape({
        name: PropTypes.string,
      }),
    })
  ).isRequired,
  add: PropTypes.bool,
};
BlogGrid.defaultProps = {
  add: false,
};

export default BlogGrid;
