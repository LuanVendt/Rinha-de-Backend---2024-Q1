-- CreateEnum
CREATE TYPE "Tipo" AS ENUM ('c', 'd');

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "tipo" "Tipo" NOT NULL,
    "descricao" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
