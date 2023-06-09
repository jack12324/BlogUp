import { useSelector } from "react-redux";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

function NavBarLinks({ orientation, clickHandler, spacing }) {
  const user = useSelector((state) => state.currentUser);
  return (
    <ButtonGroup
      colorScheme="gray"
      variant="link"
      spacing={spacing}
      orientation={orientation}
    >
      <Button fontSize="lg" onClick={clickHandler} justifyContent="left">
        <Link to="/">Home</Link>
      </Button>
      {user ? (
        <Button fontSize="lg" onClick={clickHandler} justifyContent="left">
          <Link to="/myblogs">My Blogs</Link>
        </Button>
      ) : null}
    </ButtonGroup>
  );
}

export default NavBarLinks;

NavBarLinks.propTypes = {
  orientation: PropTypes.string,
  clickHandler: PropTypes.func,
  spacing: PropTypes.string,
};
NavBarLinks.defaultProps = {
  orientation: "horizontal",
  clickHandler: () => {},
  spacing: "8",
};
