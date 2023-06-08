import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react";
import { useState } from "react";
import { createBlog } from "../reducer/blogReducer";
import { useRequiredField, useUrlField } from "../hooks";
import RequiredFormTextControl from "./RequiredFormTextControl";
import ErrorAlert from "./ErrorAlert";

function BlogForm({ onClose }) {
  const author = useRequiredField("text", "author");
  const title = useRequiredField("text", "title");
  const url = useUrlField("url");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUser);

  const validateFields = () => {
    let result = author.validate();
    result = title.validate() && result;
    result = url.validate() && result;
    return result;
  };

  const resetFields = () => {
    author.reset();
    title.reset();
    url.reset();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateFields()) {
      const err = await dispatch(
        createBlog(
          {
            author: author.input.value,
            title: title.input.value,
            url: url.input.value,
          },
          user
        )
      );
      if (!err) {
        resetFields();
        onClose();
      } else {
        setError(err);
      }
    }
  };

  return (
    <ModalContent as="form">
      <ModalHeader>
        <Heading textAlign="center">Add a Blog</Heading>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {error ? <ErrorAlert msg={error} /> : null}
        <RequiredFormTextControl field={title} name="title" />
        <RequiredFormTextControl field={author} name="author" />
        <FormControl id="url" isRequired isInvalid={url.error}>
          <FormLabel>Url</FormLabel>
          <Input
            type="url"
            value={url.input.value}
            onChange={url.input.onChange}
          />
          <FormErrorMessage>{url.error}</FormErrorMessage>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="green" bgColor="green.300" onClick={handleSubmit}>
          Add
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

BlogForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default BlogForm;
