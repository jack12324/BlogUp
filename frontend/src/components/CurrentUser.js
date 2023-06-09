import { useDispatch, useSelector } from "react-redux";
import { Button, HStack, Text, useDisclosure } from "@chakra-ui/react";
import { logout } from "../reducer/currentUserReducer";
import LoginModal from "./LoginModal";
import { useCsrBreakpointValue } from "../hooks";

function CurrentUser() {
  const user = useSelector((state) => state.currentUser);
  const dispatch = useDispatch();
  const isMobile = useCsrBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <HStack justify="space-between" spacing="4" fontSize="lg">
        {!user ? (
          <Button
            colorScheme="green"
            bg="green.300"
            fontSize="lg"
            onClick={onOpen}
          >
            Log In
          </Button>
        ) : (
          <>
            {isMobile ? null : (
              <Text color="grey.800" fontWeight="semibold">
                Welcome {user.name}!
              </Text>
            )}
            <Button
              variant="outline"
              colorScheme="gray"
              fontSize="lg"
              onClick={onLogout}
            >
              Log Out
            </Button>
          </>
        )}
      </HStack>
      <LoginModal onClose={onClose} isOpen={isOpen} />
    </>
  );
}

export default CurrentUser;
