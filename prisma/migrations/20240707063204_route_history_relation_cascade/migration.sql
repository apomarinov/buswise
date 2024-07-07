-- DropForeignKey
ALTER TABLE "route_history" DROP CONSTRAINT "route_history_routeId_fkey";

-- AddForeignKey
ALTER TABLE "route_history" ADD CONSTRAINT "route_history_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
