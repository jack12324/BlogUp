import { Center, Heading, Highlight } from "@chakra-ui/react";
import PropTypes from "prop-types";

function BlogsHeading({ msg, primaryColor, highlightStyle, highlightWord }) {
  return (
    <Center py="4">
      <Heading as="h1" size="2xl" color={primaryColor}>
        <Highlight query={highlightWord} styles={highlightStyle}>
          {msg}
        </Highlight>
      </Heading>
    </Center>
  );
}

BlogsHeading.propTypes = {
  msg: PropTypes.string.isRequired,
  primaryColor: PropTypes.string,
  highlightStyle: PropTypes.shape({
    color: PropTypes.string,
  }),
  highlightWord: PropTypes.string.isRequired,
};

BlogsHeading.defaultProps = {
  primaryColor: "grey.800",
  highlightStyle: {
    color: "green.300",
  },
};
export default BlogsHeading;
