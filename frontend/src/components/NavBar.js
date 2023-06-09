import { HStack } from "@chakra-ui/react";
import CurrentUser from "./CurrentUser";
import Logo from "./Logo";
import ColorModeButton from "./ColorModeButton";
import MobileMenu from "./MobileMenu";
import NavBarLinks from "./NavBarLinks";
import { useCsrBreakpointValue } from "../hooks";

function NavBar() {
  const isMobile = useCsrBreakpointValue({ base: true, md: false });
  return (
    <HStack
      as="nav"
      spacing={{ base: "8", sm: "10" }}
      justify="space-between"
      pt="2"
      pb="2"
      borderBottomWidth="1px"
    >
      {isMobile ? (
        <>
          <MobileMenu />
          <Logo />
          <HStack>
            <CurrentUser />
            <ColorModeButton />
          </HStack>
        </>
      ) : (
        <>
          <Logo />
          <HStack justify="space-between" spacing="8">
            <NavBarLinks />
            <HStack>
              <CurrentUser />
              <ColorModeButton />
            </HStack>
          </HStack>
        </>
      )}
    </HStack>
  );
}
export default NavBar;
