import { useState } from "react";

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
