import { Heading, Highlight } from "@chakra-ui/react";

function Logo() {
  return (
    <Heading as="h1" size="lg" color="grey.800">
      <Highlight query="Up" styles={{ color: "green.300" }}>
        BlogUp
      </Highlight>
    </Heading>
  );
}
export default Logo;
