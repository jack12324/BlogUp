import { createStandaloneToast } from "@chakra-ui/react";

export const errorToast = (msg) => {
  const { toast } = createStandaloneToast();
  toast({
    description: msg,
    status: "error",
    duration: 3000,
    isClosable: true,
  });
};

export const successToast = (msg) => {
  const { toast } = createStandaloneToast();
  toast({
    description: msg,
    status: "success",
    duration: 3000,
    isClosable: true,
  });
};
