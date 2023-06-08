import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { useField, useRequiredField } from "../hooks";
import RequiredFormTextControl from "./RequiredFormTextControl";
import RequiredFormPasswordControl from "./RequiredFormPasswordControl";
import { signUp } from "../reducer/usersReducer";
import ErrorAlert from "./ErrorAlert";

function SignupForm({ onClose, logInClicked }) {
  const username = useRequiredField("text", "username");
  const password = useRequiredField("text", "password");
  const displayName = useField("text");
  const [error, setError] = useState("");
  const validate = () => {
    let result = username.validate();
    result = password.validate() && result;
    return result;
  };

  const dispatch = useDispatch();

  const signup = async () => {
    if (validate()) {
      const errorMessage = await dispatch(
        signUp({
          username: username.input.value,
          password: password.input.value,
          name: displayName.input.value,
        })
      );
      if (!errorMessage) {
        password.reset();
        username.reset();
        onClose();
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <ModalContent as="form">
      <ModalHeader>
        <Heading textAlign="center">Sign Up</Heading>
        <Text pt="2" fontWeight="normal" fontSize="md" textAlign="center">
          Already a user?
          <Button
            pl="1"
            colorScheme="green"
            variant="link"
            onClick={logInClicked}
          >
            Log in
          </Button>
        </Text>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {error && <ErrorAlert msg={error} />}
        <RequiredFormTextControl field={username} name="username" />
        <RequiredFormPasswordControl field={password} />
        <FormControl id="displayName">
          <FormLabel>Display Name</FormLabel>
          <Input
            type={displayName.input.type}
            value={displayName.input.value}
            onChange={displayName.input.onChange}
          />
          <FormHelperText>
            This is the name that will display on blogs you add. If none is
            supplied, your username will be used
          </FormHelperText>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="green" bgColor="green.300" onClick={signup}>
          Sign Up
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

SignupForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  logInClicked: PropTypes.func.isRequired,
};

export default SignupForm;
