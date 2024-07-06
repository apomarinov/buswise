import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import React, { useRef } from "react";

export type ModalConfirmProps = {
  title: string;
  description: string;
  confirmText: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  title,
  description,
  confirmText,
  isLoading,
  onCancel,
  onConfirm,
}) => {
  const cancelRef = useRef(null);

  return (
    <>
      <AlertDialog
        isOpen={true}
        leastDestructiveRef={cancelRef}
        onClose={onCancel}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {title}
            </AlertDialogHeader>
            <AlertDialogBody>{description}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} isDisabled={isLoading} onClick={onCancel}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={onConfirm}
                ml={3}
                isLoading={isLoading}
              >
                {confirmText}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ModalConfirm;
