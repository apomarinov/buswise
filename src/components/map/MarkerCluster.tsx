import React from "react";

type Props = {
  lat: number;
  lng: number;
  count: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
};

const MarkerCluster: React.FC<Props> = ({ lat, lng, onClick, count }) => {
  return (
    <div>
      <div
        className="bg-white border-2 border-gray-200 w-9 h-9 p-2 text-[14px] hover:bg-gray-200 active:bg-white cursor-pointer flex items-center justify-center rounded-full"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(e);
        }}
      >
        {count}
      </div>
    </div>
  );
};

export default MarkerCluster;
