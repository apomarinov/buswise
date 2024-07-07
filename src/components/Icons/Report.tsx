import React from "react";

type Props = {
  size?: number;
  cls?: string;
} & React.SVGProps<SVGSVGElement>;

const Report: React.FC<Props> = ({ size, cls, ...rest }) => {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height={`${size ?? 0.9}rem`}
      width={`${size ?? 0.9}rem`}
      className={cls}
      {...rest}
    >
      <path d="M8 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h5.697"></path>
      <path d="M18 14v4h4"></path>
      <path d="M18 11v-4a2 2 0 0 0 -2 -2h-2"></path>
      <path d="M8 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path>
      <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
      <path d="M8 11h4"></path>
      <path d="M8 15h3"></path>
    </svg>
  );
};

export default Report;
