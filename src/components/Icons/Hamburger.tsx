import type React from "react";

type Props = {
  size?: number;
  cls?: string;
} & React.SVGProps<SVGSVGElement>;

const Hambuger: React.FC<Props> = ({ size, cls, ...rest }) => {
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
      <path d="M32 96v64h448V96H32zm0 128v64h448v-64H32zm0 128v64h448v-64H32z"></path>
    </svg>
  );
};

export default Hambuger;
