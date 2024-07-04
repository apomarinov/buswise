import { type NextApiResponse } from "next";

const success = (res: NextApiResponse, data?: unknown) => {
  res.status(200).json({ data, success: true });
};

const error = (
  res: NextApiResponse,
  message: string,
  errors?: unknown[],
  code = 400,
) => {
  res.status(code).json({ message, errors, success: false });
};

const exports = {
  success,
  error,
};

export default exports;
