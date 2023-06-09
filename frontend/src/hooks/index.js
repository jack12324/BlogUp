import { useState } from "react";
import { useBreakpointValue } from "@chakra-ui/react";

export const useField = (type, initialValue = "") => {
  const [value, setValue] = useState(initialValue);

  const onChange = (event) => {
    setValue(event.target.value);
  };

  const reset = () => {
    setValue("");
  };

  const input = {
    type,
    value,
    onChange,
  };

  return {
    reset,
    input,
  };
};

export const useRequiredField = (type, name, initial = "") => {
  const { input, reset } = useField(type, initial);
  const [error, setError] = useState("");

  const validate = () => {
    if (!input.value) {
      setError(`${name} is required`);
      return false;
    }
    setError("");
    return true;
  };

  return {
    validate,
    reset,
    error,
    setError,
    input,
  };
};

export const useUrlField = (name) => {
  const {
    validate: validateParent,
    reset,
    error,
    setError,
    input,
  } = useRequiredField("url", name, "https://");

  const validate = () => {
    if (!input.value.startsWith("https://")) {
      setError("Url must start with https://");
      return false;
    }
    return validateParent();
  };

  return {
    validate,
    reset,
    error,
    input,
  };
};

// useBreakpoint loads base by default, which causes a flicker when loading. Since we aren't
// using server side rendering, we can turn off ssr here, which will stop the flicker from
// happening
export const useCsrBreakpointValue = (values, arg) =>
  useBreakpointValue(values, { ...arg, ssr: false });
