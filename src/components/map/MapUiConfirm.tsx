import { Button } from "@chakra-ui/react";
import React from "react";

export type MapUiConfirmProps = {
  text: string;
  btnText: string;
  isLoading: boolean;
  onConfirm: () => void;
  onNew?: () => void;
  onCancel: () => void;
};

const MapUiConfirm: React.FC<MapUiConfirmProps> = ({
  text,
  btnText,
  onConfirm,
  onCancel,
  onNew,
  isLoading,
}) => {
  return (
    <div className="bg-white drop-shadow-md rounded-lg p-2 flex flex-col gap-2">
      <p className="text-[13px]">{text}</p>
      <Button
        size="sm"
        className="!text-gray-700"
        isLoading={isLoading}
        onClick={onConfirm}
      >
        {btnText}
      </Button>
      {onNew && (
        <Button
          size="sm"
          className="!text-gray-700"
          isLoading={isLoading}
          onClick={onNew}
        >
          New Route
        </Button>
      )}
      <Button
        size="sm"
        colorScheme="yellow"
        className="!text-gray-700"
        isDisabled={isLoading}
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
};

export default MapUiConfirm;
