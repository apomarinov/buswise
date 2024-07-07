import { Button } from "@chakra-ui/react";
import React from "react";

export type MapUiConfirmProps = {
  text?: string;
  isLoading: boolean;
  actions: {
    text: string;
    action: () => void;
  }[];
  onCancel: () => void;
};

const MapUiConfirm: React.FC<MapUiConfirmProps> = ({
  text,
  onCancel,
  isLoading,
  actions,
}) => {
  return (
    <div className="bg-white drop-shadow-md rounded-lg p-2 flex flex-col gap-2">
      {text && <p className="text-[13px]">{text}</p>}
      {actions.map((cfg) => (
        <Button
          key={cfg.text}
          size="sm"
          className="!text-gray-700"
          isLoading={isLoading}
          onClick={cfg.action}
        >
          {cfg.text}
        </Button>
      ))}

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
