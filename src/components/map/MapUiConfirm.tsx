import { Button, Select } from "@chakra-ui/react";
import React from "react";

export type MapUiConfirmProps = {
  text?: string;
  isLoading: boolean;
  actions: {
    text?: string;
    danger?: boolean;
    action: () => void;
    select?: {
      placeholder: string;
      options: {
        name: string;
        value: number;
      }[];
      onChange: (value: number) => void;
    };
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
    <div className="pointer-events-auto w-full bg-white drop-shadow-md rounded-lg p-2 flex flex-col gap-2 max-w-fit">
      {text && <p className="text-[13px]">{text}</p>}
      {actions.map((cfg, idx) => (
        <div className="w-full" key={idx}>
          {!cfg.select && (
            <Button
              size="sm"
              className={
                cfg.danger ? "!text-white w-full" : "!text-gray-700 w-full"
              }
              colorScheme={cfg.danger ? "red" : undefined}
              isLoading={isLoading}
              onClick={cfg.action}
            >
              {cfg.text}
            </Button>
          )}
          {cfg.select && (
            <Select
              className="w-full"
              placeholder={cfg.select.placeholder}
              onChange={(e) => cfg.select?.onChange(parseInt(e.target.value))}
            >
              {cfg.select.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </Select>
          )}
        </div>
      ))}

      <Button
        size="sm"
        colorScheme="yellow"
        className="!text-gray-700 w-full"
        isDisabled={isLoading}
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
};

export default MapUiConfirm;
