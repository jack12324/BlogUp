import { Modal, ModalOverlay } from "@chakra-ui/react";
import PropTypes from "prop-types";
import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

function LoginModal({ isOpen, onClose }) {
  const [signup, setSignup] = useState(false);

  const close = () => {
    setSignup(false);
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalOverlay />
      {signup ? (
        <SignupForm onClose={close} logInClicked={() => setSignup(!signup)} />
      ) : (
        <LoginForm onClose={close} signupClicked={() => setSignup(!signup)} />
      )}
    </Modal>
  );
}

LoginModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LoginModal;
