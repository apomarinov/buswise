import React from "react";

type Props = {
  size?: number;
  cls?: string;
} & React.SVGProps<SVGSVGElement>;

const Reorder: React.FC<Props> = ({ size, cls, ...rest }) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height={`${size ?? 1}rem`}
      width={`${size ?? 1}rem`}
      className={cls}
      {...rest}
    >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path d="M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7zm4-2v2h12V5H10zm0 14h12v-2H10v2zm0-6h12v-2H10v2z"></path>
    </svg>
  );
};

export default Reorder;
