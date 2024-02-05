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

        const client = await this.clientsRepository.create({
            nome: data.nome,
            limite: data.limite,
            saldo: data.limite
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

    async createTransaction(id: string, data: CreateTransactionDto) {
        // Obter informações do cliente
        let { limite, saldo } = await this.clientsRepository.findUnique(id);

        console.log(saldo)

        // Verificar condições da transação
        if (data.tipo === "d" && (saldo <= 0 || saldo < data.valor)) {
            throw new BadRequestException('Saldo insuficiente para transação.');
        } else if (data.tipo === "c" && Math.abs(saldo) <= limite) {
            saldo -= data.valor;
        } else if (data.tipo === "c" && (data.valor + Math.abs(saldo) > limite)) {
            throw new BadRequestException('Limite excedido.');
        } else {
            saldo -= data.valor;
        }

        console.log(saldo)

        // Criar a transação
        const transaction = await this.clientsRepository.createTransaction(id, data);

        // Atualizar o saldo no banco de dados
        return {
            limite,
            saldo,
        };
    }

    async findAllClientTransactions(id: string) {
        const clientTransactions = await this.clientsRepository.findAllClientTransactions(id)

        return clientTransactions
    }

    async findUniqueTransaction(id: string) {
        const transaction = await this.clientsRepository.findUniqueTransaction(id)

        if (!transaction) {
            throw new BadRequestException('Transação não encontrada.')
        }
    }

    async updateTransaction(id: string, dataTransaction: UpdateTransactionDto) {
        const transaction = await this.clientsRepository.findUniqueTransaction(id)

        if (!transaction) {
            throw new BadRequestException('Transação não encontrada.')
        }

        const updatedTransaction = await this.clientsRepository.updateTransaction(id, dataTransaction)
    }

    async deleteTransaction(id: string) {
        const transaction = await this.clientsRepository.findUniqueTransaction(id)

        if (!transaction) {
            throw new BadRequestException('Transação não encontrada.')
        }

        const deletedTransaction = await this.clientsRepository.deleteTransaction(id)
    }
}