import { Module } from "@nestjs/common";
import { PrismaService } from "src/database/prisma-service";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { clientsRepository } from "./repositories/client.repository";
import { PrismaClientsRepository } from "./repositories/prisma/prisma-client-repository";

@Module({
    controllers: [ClientsController],
    providers: [
        ClientsService,
        PrismaService,
        PrismaClientsRepository,
        { provide: clientsRepository, useClass: PrismaClientsRepository }
    ]
})
export class ClientsModule { }