import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateClientDto } from "./dto/create-client.dto";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { QueryClientsDto } from "./dto/query-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { clientsRepository } from "./repositories/client.repository";

@Injectable()
export class ClientsService {
    constructor(
        private clientsRepository: clientsRepository,
    ) { }

    async create(data: CreateClientDto) {
        if (!data.limite) {
            throw new Error('Limite é obrigatório.')
        }

        if (!data.nome) {
            throw new Error('Nome é obrigatório.')
        }

        const client = await this.clientsRepository.create(data)

        return client
    }

    async findAll(query: QueryClientsDto) {
        const clients = await this.clientsRepository.findAll(query)

        return clients
    }

    async findUnique(id: string) {
        const client = await this.clientsRepository.findUnique(parseInt(id))

        if (!client) {
            throw new BadRequestException('Cliente não encontrado.')
        }

        return client
    }

    async update(id: string, data: UpdateClientDto) {
        const client = await this.clientsRepository.findUnique(parseInt(id))

        if (!client) {
            throw new BadRequestException('Cliente não encontrado.')
        }

        const updatedClient = await this.clientsRepository.update(parseInt(id), data)
    }

    async delete(id: string) {
        const client = await this.clientsRepository.findUnique(parseInt(id))

        if (!client) {
            throw new BadRequestException('Cliente não encontrado.')
        }

        await this.clientsRepository.delete(parseInt(id))
    }

    async createTransaction(id: string, data: CreateTransactionDto) {
        const { limite, saldo } = await this.clientsRepository.createTransaction(parseInt(id), data);

        return {
            limite,
            saldo,
        };
    }

    async findAllClientTransactions(id: string) {
        const client = await this.clientsRepository.findUnique(parseInt(id))

        if (!client) {
            throw new BadRequestException('Cliente não encontrado.')
        }

        const clientTransactions = await this.clientsRepository.findAllClientTransactions(parseInt(id))

        const { limite } = await this.clientsRepository.findUnique(parseInt(id))

        const saldo = await this.clientsRepository.findSaldo(parseInt(id))

        const data_extrato = new Date()

        const transactionsWithoutClientId = clientTransactions.map(transaction => {
            const { cliente_id, ...transactionsWithoutClientId } = transaction
            return transactionsWithoutClientId
        })


        return {
            saldo: {
                total: saldo.valor,
                data_extrato,
                limite: client.limite
            },
            ultimas_transacoes: transactionsWithoutClientId
        }
    }

    async findUniqueTransaction(id: string) {
        const transaction = await this.clientsRepository.findUniqueTransaction(parseInt(id))

        if (!transaction) {
            throw new BadRequestException('Transação não encontrada.')
        }
    }

    async updateTransaction(id: string, dataTransaction: UpdateTransactionDto) {
        const transaction = await this.clientsRepository.findUniqueTransaction(parseInt(id))

        if (!transaction) {
            throw new BadRequestException('Transação não encontrada.')
        }

        const updatedTransaction = await this.clientsRepository.updateTransaction(parseInt(id), dataTransaction)
    }

    async deleteTransaction(id: string) {
        const transaction = await this.clientsRepository.findUniqueTransaction(parseInt(id))

        if (!transaction) {
            throw new BadRequestException('Transação não encontrada.')
        }

        const deletedTransaction = await this.clientsRepository.deleteTransaction(parseInt(id))
    }
}