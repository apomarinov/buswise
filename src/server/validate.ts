import { type AnyZodObject } from "zod";

export type ValidationError = {
  field: string;
  message: string;
};

export default function validate<T>(data: unknown, schema: AnyZodObject): T {
  return schema.parse(data) as T;
}
