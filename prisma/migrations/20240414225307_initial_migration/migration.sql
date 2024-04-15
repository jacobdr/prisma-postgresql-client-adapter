-- CreateTable
CREATE TABLE "kitchen_sink" (
    "id" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL,
    "count_int" INTEGER NOT NULL,
    "count_bingint" BIGINT NOT NULL,
    "count_float" DOUBLE PRECISION NOT NULL,
    "count_decimal" DECIMAL(65,30) NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "timestamp_tz" TIMESTAMPTZ NOT NULL,
    "time_without_zone" TIME NOT NULL,
    "time_with_zone" TIMETZ NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "kitchen_sink_id_key" ON "kitchen_sink"("id");
