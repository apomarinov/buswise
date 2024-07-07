/*
  Warnings:

  - A unique constraint covering the columns `[routeId]` on the table `route_history` will be added. If there are existing duplicate values, this will fail.
  - Made the column `data` on table `route_history` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "route_history" DROP CONSTRAINT "route_history_routeId_fkey";

-- AlterTable
ALTER TABLE "route_history" ALTER COLUMN "data" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "route_history_routeId_key" ON "route_history"("routeId");

-- AddForeignKey
ALTER TABLE "route_history" ADD CONSTRAINT "route_history_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
