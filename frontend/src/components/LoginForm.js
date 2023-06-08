import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Heading,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import { loginUser } from "../reducer/currentUserReducer";
import ErrorAlert from "./ErrorAlert";
import { useRequiredField } from "../hooks";
import RequiredFormTextControl from "./RequiredFormTextControl";
import RequiredFormPasswordControl from "./RequiredFormPasswordControl";

function LoginForm({ onClose, signupClicked }) {
  const username = useRequiredField("text", "username");
  const password = useRequiredField("text", "password");
  const [error, setError] = useState("");
  const validate = () => {
    let result = password.validate();
    result = username.validate() && result;
    return result;
  };

  const dispatch = useDispatch();

  const login = async () => {
    if (validate()) {
      const loginError = await dispatch(
        loginUser({
          username: username.input.value,
          password: password.input.value,
        })
      );
      if (!loginError) {
        password.reset();
        username.reset();
        onClose();
      } else {
        setError(loginError);
      }
    }
  };

  return (
    <ModalContent as="form">
      <ModalHeader>
        <Heading textAlign="center">Log In</Heading>
        <Text pt="2" fontWeight="normal" fontSize="md" textAlign="center">
          New here?
          <Button
            pl="1"
            colorScheme="green"
            variant="link"
            onClick={signupClicked}
          >
            Sign up
          </Button>
        </Text>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {error && <ErrorAlert msg={error} />}
        <RequiredFormTextControl field={username} name="username" />
        <RequiredFormPasswordControl field={password} />
      </ModalBody>
      <ModalFooter>
        <Button
          id="login-form-submit"
          colorScheme="green"
          bgColor="green.300"
          onClick={login}
        >
          Log In
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

LoginForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  signupClicked: PropTypes.func.isRequired,
};

export default LoginForm;
