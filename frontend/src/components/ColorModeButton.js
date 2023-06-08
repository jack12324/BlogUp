import { IconButton, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

function ColorModeButton() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="dark mode"
      variant="ghost"
      onClick={toggleColorMode}
    >
      {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
    </IconButton>
  );
}
export default ColorModeButton;
