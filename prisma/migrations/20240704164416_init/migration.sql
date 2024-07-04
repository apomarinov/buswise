-- CreateTable
CREATE TABLE "bus_stops" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "description" VARCHAR(150) NOT NULL,
    "latitude" DECIMAL(7,4) NOT NULL,
    "longitude" DECIMAL(7,4) NOT NULL,

    CONSTRAINT "bus_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(40) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_history" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "data" JSONB,

    CONSTRAINT "route_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_bus_stops" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "busStopId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "distance" INTEGER,
    "travelTime" INTEGER,
    "geoPoints" JSONB,

    CONSTRAINT "route_bus_stops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bus_stops_name_key" ON "bus_stops"("name");

-- CreateIndex
CREATE UNIQUE INDEX "routes_name_key" ON "routes"("name");

-- CreateIndex
CREATE INDEX "route_history_routeId_idx" ON "route_history"("routeId");

-- CreateIndex
CREATE INDEX "route_bus_stops_routeId_idx" ON "route_bus_stops"("routeId");

-- CreateIndex
CREATE INDEX "route_bus_stops_busStopId_idx" ON "route_bus_stops"("busStopId");

-- CreateIndex
CREATE UNIQUE INDEX "route_bus_stops_routeId_busStopId_key" ON "route_bus_stops"("routeId", "busStopId");

-- AddForeignKey
ALTER TABLE "route_history" ADD CONSTRAINT "route_history_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_bus_stops" ADD CONSTRAINT "route_bus_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_bus_stops" ADD CONSTRAINT "route_bus_stops_busStopId_fkey" FOREIGN KEY ("busStopId") REFERENCES "bus_stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
