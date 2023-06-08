import PropTypes from "prop-types";
import { Alert, AlertIcon } from "@chakra-ui/react";

function ErrorAlert({ msg }) {
  return (
    <Alert status="error">
      <AlertIcon />
      {msg}
    </Alert>
  );
}

ErrorAlert.propTypes = {
  msg: PropTypes.string.isRequired,
};

export default ErrorAlert;
