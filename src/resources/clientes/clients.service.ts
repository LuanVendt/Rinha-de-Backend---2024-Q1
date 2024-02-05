import { Injectable } from "@nestjs/common";
import { clientsRepository } from "./repositories/client.repository";
import { QueryClientsDto } from "./dto/query-client.dto";

@Injectable()
export class ClientsService {
    constructor(
        private clientsRepository: clientsRepository
    ) { }

    async findAll(query: QueryClientsDto) {
        const clients = await this.clientsRepository.findAll(query)

        return clients
    }
}