/*
  Warnings:

  - Made the column `distance` on table `route_bus_stops` required. This step will fail if there are existing NULL values in that column.
  - Made the column `travelTime` on table `route_bus_stops` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "route_bus_stops" ALTER COLUMN "distance" SET NOT NULL,
ALTER COLUMN "distance" SET DEFAULT 0,
ALTER COLUMN "travelTime" SET NOT NULL,
ALTER COLUMN "travelTime" SET DEFAULT 0;
