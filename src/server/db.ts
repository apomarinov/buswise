import { PrismaClient } from "@prisma/client";

import { env } from "app/env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

export const DbErrorCodeToMessage: { [k in string]: string } = {
  P2002: "Record exists",
  P2025: "Record not found",
};

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
