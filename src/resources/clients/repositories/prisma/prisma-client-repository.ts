import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma-service";
import { QueryClientsDto } from "../../dto/query-client.dto";
import { UpdateClientDto } from "../../dto/update-client.dto";
import { UpdateTransactionDto } from "../../dto/update-transaction.dto";
import { ClientEntity } from "../../entities/client.entity";
import { TransactionEntity } from "../../entities/transaction.entity";
import { clientsRepository } from "../client.repository";

@Injectable()
export class PrismaClientsRepository implements clientsRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: ClientEntity) {
        const client = await this.prisma.client.create({
            data: {
                nome: data.nome,
                limite: data.limite,
                saldo: data.limite
            }
        })

        return client
    }

    async findAll(query: QueryClientsDto) {
        let { page = 1, limit = 10, search = '' } = query;

        page = Number(page)
        limit = Number(limit)
        search = String(search);

        const skip = (page - 1) * limit;

        const total = await this.prisma.client.count({
            where: {
                OR: [
                    {
                        nome: {
                            contains: search,
                        },
                    },
                ]
            }
        })

        const users = await this.prisma.client.findMany({
            where: {
                OR: [
                    {
                        nome: {
                            contains: search,
                        },
                    },
                ],
            },
            skip,
            take: limit,
        })

        return {
            total,
            page,
            search,
            limit,
            pages: Math.ceil(total / limit),
            data: users
        }

    }

    async findUnique(id: string) {
        const client = await this.prisma.client.findUnique({
            where: {
                id,
            }
        })

        return client
    }

    async update(id: string, dataClient: UpdateClientDto) {
        const client = await this.prisma.client.update({
            where: {
                id,
            },
            data: {
                nome: dataClient.nome,
                limite: dataClient.limite,
            }
        })

        return client
    }

    async delete(id: string) {
        await this.prisma.transaction.deleteMany({
            where: {
                client_id: id,
            }
        })

        const client = await this.prisma.client.delete({
            where: {
                id,
            }
        })
    }

    async createTransaction(id: string, data: TransactionEntity) {
        let { limite, saldo } = await this.prisma.client.findUnique({
            where: {
                id,
            }
        })

        if (saldo > 0 && data.tipo == "d" && saldo > data.valor) {
            saldo -= data.valor
        } else if (saldo < 0 && data.tipo == "d") {
            throw new BadRequestException('Transação acima do saldo.')
        } else if (data.tipo == "c" && Math.abs(saldo) < limite) {
            saldo -= data.valor
        } else if (data.tipo == "c" && saldo < 0 && (Math.abs(saldo) + data.valor) > limite) {
            throw new BadRequestException('Limite Excedido.')
        }

        const transaction = await this.prisma.transaction.create({
            data: {
                valor: data.valor,
                tipo: data.tipo,
                descricao: data.descricao,
                client_id: id,
            }
        })

        await this.prisma.client.update({
            where: {
                id,
            },
            data: {
                saldo: saldo
            }
        })

        return {
            limite,
            saldo
        }
    }

    async findAllClientTransactions(id: string) {
        const clientTransactions = await this.prisma.transaction.findMany({
            where: {
                client_id: id,
            },
        })

        const transactionsWithRenamedDateField = clientTransactions.map(transaction => {
            // Remover o campo 'id' de cada transação
            const { id, ...transactionWithoutId } = transaction;
            return {
                ...transactionWithoutId,
                realizada_em: transaction.date, // Renomeando o campo date para realizada_em
                date: undefined // Removendo o campo date original
            };
        });

        return transactionsWithRenamedDateField
    }

    async findUniqueTransaction(id: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: {
                id,
            }
        })

        return transaction
    }

    async updateTransaction(id: string, dataTransaction: UpdateTransactionDto) {
        const transaction = await this.prisma.transaction.update({
            where: {
                id,
            },
            data: {
                valor: dataTransaction.valor,
                tipo: dataTransaction.tipo,
                descricao: dataTransaction.descricao,
                client_id: dataTransaction.client_id,
            }
        })

        return transaction
    }

    async deleteTransaction(id: string) {
        const transaction = await this.prisma.transaction.delete({
            where: {
                id,
            }
        })
    }
}