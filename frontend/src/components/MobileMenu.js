import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import Logo from "./Logo";
import NavBarLinks from "./NavBarLinks";

function MobileMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton
        aria-label="Open Menu"
        variant="ghost"
        icon={
          isOpen ? <CloseIcon boxSize="4" /> : <HamburgerIcon boxSize="8" />
        }
        onClick={isOpen ? onClose : onOpen}
      />
      {isOpen ? (
        <Drawer isOpen={isOpen} onClose={onClose} placement="left" size="xs">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px" pt="2" pb="2">
              <Logo />
              <DrawerCloseButton />
            </DrawerHeader>
            <DrawerBody>
              <NavBarLinks
                orientation="vertical"
                clickHandler={onClose}
                spacing="4"
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ) : null}
    </>
  );
}

export default MobileMenu;
