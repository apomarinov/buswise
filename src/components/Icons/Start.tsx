import React from "react";

type Props = {
  size?: number;
  cls?: string;
} & React.SVGProps<SVGSVGElement>;

const Start: React.FC<Props> = ({ size, cls, ...rest }) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="0"
      height={`${size ?? 2}rem`}
      width={`${size ?? 2}rem`}
      className={cls}
      {...rest}
    >
      <path d="M4 5a1 1 0 0 1 .3 -.714a6 6 0 0 1 8.213 -.176l.351 .328a4 4 0 0 0 5.272 0l.249 -.227c.61 -.483 1.527 -.097 1.61 .676l.005 .113v9a1 1 0 0 1 -.3 .714a6 6 0 0 1 -8.213 .176l-.351 -.328a4 4 0 0 0 -5.136 -.114v6.552a1 1 0 0 1 -1.993 .117l-.007 -.117v-16z"></path>
    </svg>
  );
};

export default Start;