import { Button } from "@chakra-ui/react";
import Close from "app/components/Icons/Close";
import React from "react";

export type MapUiConfirmProps = {
  text: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const MapUiConfirm: React.FC<MapUiConfirmProps> = ({
  text,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  return (
    <div>
      <Button
        size="sm"
        isLoading={isLoading}
        colorScheme="blue"
        onClick={onConfirm}
      >
        {text}
      </Button>
      <Button
        size="sm"
        isDisabled={isLoading}
        className="ml-2 !p-0"
        onClick={onCancel}
      >
        <Close size={1} />
      </Button>
    </div>
  );
};

export default MapUiConfirm;
