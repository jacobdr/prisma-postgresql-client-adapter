/*
  Warnings:

  - Added the required column `float_double_precision` to the `kitchen_sink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `float_real` to the `kitchen_sink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inet` to the `kitchen_sink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `int_int` to the `kitchen_sink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `int_oid` to the `kitchen_sink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `json_json` to the `kitchen_sink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `json_jsonb` to the `kitchen_sink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `small_int` to the `kitchen_sink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xml` to the `kitchen_sink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "kitchen_sink" ADD COLUMN     "float_double_precision" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "float_real" REAL NOT NULL,
ADD COLUMN     "inet" INET NOT NULL,
ADD COLUMN     "int_int" INTEGER NOT NULL,
ADD COLUMN     "int_oid" OID NOT NULL,
ADD COLUMN     "json_json" JSONB NOT NULL,
ADD COLUMN     "json_jsonb" JSONB NOT NULL,
ADD COLUMN     "small_int" SMALLINT NOT NULL,
ADD COLUMN     "xml" XML NOT NULL;
