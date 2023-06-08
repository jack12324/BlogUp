import PropTypes from "prop-types";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";

function RequiredFormPasswordControl({ field }) {
  const [showPassword, setShowPassword] = useState();
  return (
    <FormControl id="password" isRequired isInvalid={field.error}>
      <FormLabel>Password</FormLabel>
      <InputGroup>
        <Input
          type={showPassword ? "text" : "password"}
          onChange={field.input.onChange}
          value={field.input.value}
        />
        <InputRightElement h="full">
          <Button
            variant="ghost"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
          </Button>
        </InputRightElement>
      </InputGroup>
      <FormErrorMessage>{field.error}</FormErrorMessage>
    </FormControl>
  );
}

RequiredFormPasswordControl.propTypes = {
  field: PropTypes.shape({
    error: PropTypes.string.isRequired,
    input: PropTypes.shape({
      value: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};

export default RequiredFormPasswordControl;
