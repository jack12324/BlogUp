import { Center, Modal, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import BlogForm from "./BlogForm";

function AddBlogCard() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Center
        data-cy="add-blog"
        height="300px"
        cursor="pointer"
        onClick={onOpen}
      >
        <Center
          h="300px"
          w="300px"
          rounded="md"
          overflow="hidden"
          border="1px"
          borderColor="grey"
        >
          <AddIcon boxSize="30%" color="green.300" />
        </Center>
      </Center>
      <Modal onClose={onClose} isOpen={isOpen}>
        <ModalOverlay />
        <BlogForm onClose={onClose} />
      </Modal>
    </>
  );
}
export default AddBlogCard;
