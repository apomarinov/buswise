import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { type ValidationError } from "app/server/validate";
import { Prisma } from "@prisma/client";
import { DbErrorCodeToMessage } from "app/server/db";
import response from "app/server/response";

export const handler = (action: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await action(req, res);
    } catch (e) {
      let message = "Unknown Error";
      if (e instanceof Error) message = e.message;
      if (e instanceof ZodError) {
        message = "Validation Error";
        const errors: ValidationError[] = [];
        e.errors.forEach((item) => {
          errors.push({
            field: item.path.join("."),
            message: item.message,
          });
        });
        response.error(res, message, errors);
        return;
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        message = DbErrorCodeToMessage[e.code] ?? message;
      }
      response.error(res, message);
    }
  };
};
