import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

function RequiredFormTextControl({ name, field }) {
  return (
    <FormControl id={name} isRequired isInvalid={field.error}>
      <FormLabel>{name[0].toUpperCase() + name.slice(1)}</FormLabel>
      <Input
        type={field.input.type}
        value={field.input.value}
        onChange={field.input.onChange}
      />
      <FormErrorMessage>{field.error}</FormErrorMessage>
    </FormControl>
  );
}

RequiredFormTextControl.propTypes = {
  name: PropTypes.string.isRequired,
  field: PropTypes.shape({
    error: PropTypes.string.isRequired,
    input: PropTypes.shape({
      type: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};

export default RequiredFormTextControl;
