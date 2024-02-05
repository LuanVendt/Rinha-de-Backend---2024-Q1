import { Injectable } from "@nestjs/common";
import { CreateClientDto } from "./dto/create-client.dto";
import { QueryClientsDto } from "./dto/query-client.dto";
import { clientsRepository } from "./repositories/client.repository";

@Injectable()
export class ClientsService {
    constructor(
        private clientsRepository: clientsRepository
    ) { }

    async create(data: CreateClientDto) {
        if (!data.limite) {
            throw new Error('Limite é obrigatório.')
        }

        if (!data.nome) {
            throw new Error('Nome é obrigatório.')
        }

        const client = await this.clientsRepository.create({
            nome: data.nome,
            limite: data.limite
        })

        return client
    }

    async findAll(query: QueryClientsDto) {
        const clients = await this.clientsRepository.findAll(query)

        return clients
    }

    async 
}