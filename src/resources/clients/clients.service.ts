import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateClientDto } from "./dto/create-client.dto";
import { QueryClientsDto } from "./dto/query-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
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

    async findUnique(id: string) {
        const client = await this.clientsRepository.findUnique(id)

        if (!client) {
            throw new BadRequestException('Cliente não encontrado.')
        }

        return client
    }

    async update(id: string, data: UpdateClientDto) {
        const client = await this.clientsRepository.findUnique(id)

        if (!client) {
            throw new BadRequestException('Cliente não encontrado.')
        }

        const updatedClient = await this.clientsRepository.update(id, data)
    }

    async delete(id: string) {
        const client = await this.clientsRepository.findUnique(id)

        if (!client) {
            throw new BadRequestException('Cliente não encontrado.')
        }

        await this.clientsRepository.delete(id)
    }
}