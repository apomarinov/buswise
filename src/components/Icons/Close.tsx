import type React from "react";

type Props = {
  size?: number;
  cls?: string;
} & React.SVGProps<SVGSVGElement>;

const Close: React.FC<Props> = ({ size, cls, ...rest }) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 512 512"
      height={`${size ?? 2}rem`}
      width={`${size ?? 2}rem`}
      className={cls}
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"></path>
    </svg>
  );
};

export default Close;
