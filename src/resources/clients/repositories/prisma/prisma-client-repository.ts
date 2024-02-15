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
        const client = await this.prisma.clientes.create({
            data: {
                nome: data.nome,
                limite: data.limite,
            }
        })

        await this.prisma.saldos.create({
            data: {
                cliente_id: client.id,
                valor: 0,
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

        const total = await this.prisma.clientes.count({
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

        const users = await this.prisma.clientes.findMany({
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

    async findUnique(id: number) {
        const client = await this.prisma.clientes.findUnique({
            where: {
                id: id,
            }
        })

        return client
    }

    async update(id: number, dataClient: UpdateClientDto) {
        const client = await this.prisma.clientes.update({
            where: {
                id: id,
            },
            data: {
                nome: dataClient.nome,
                limite: dataClient.limite,
            }
        })

        return client
    }

    async delete(id: number) {
        await this.prisma.transacoes.deleteMany({
            where: {
                cliente_id: id,
            }
        })

        await this.prisma.saldos.deleteMany({
            where: {
                cliente_id: id
            }
        })

        await this.prisma.clientes.delete({
            where: {
                id: id,
            }
        })
    }

    async createTransaction(id: number, data: TransactionEntity) {
        const client = await this.prisma.clientes.findUnique({
            where: {
                id: id,
            }
        });

        if (data.tipo === "d") {
            const { valor: saldoAtual } = await this.prisma.saldos.findUnique({
                where: {
                    id: id
                },
            });

            const novoSaldo = saldoAtual - data.valor;

            if (novoSaldo < 0 && Math.abs(novoSaldo) > client.limite) {
                throw new BadRequestException('Limite excedido.');
            }
        }

        const transaction = await this.prisma.transacoes.create({
            data: {
                valor: data.valor,
                tipo: data.tipo,
                descricao: data.descricao,
                cliente_id: id,
            }
        });

        const saldo = await this.prisma.saldos.findFirst({
            where: {
                cliente_id: client.id
            }
        })

        await this.prisma.saldos.update({
            where: {
                id: saldo.id,
            },
            data: {
                valor: {
                    increment: data.tipo === "c" ? data.valor : -data.valor
                }
            }
        });

        const { valor: saldoAtualizado } = await this.prisma.saldos.findUnique({
            where: {
                id: id
            },
        });

        return {
            limite: client.limite,
            saldo: saldoAtualizado,
        };
    }


    async findAllClientTransactions(id: number) {
        const clientTransactions = await this.prisma.transacoes.findMany({
            where: {
                cliente_id: id,
            },
            orderBy: {
                realizada_em: 'desc'
            },
            take: 10
        })

        const transactionsWithRenamedDateField = clientTransactions.map(transaction => {
            const { id, ...transactionWithoutId } = transaction;
            return {
                ...transactionWithoutId,
                realizada_em: transaction.realizada_em,
                date: undefined
            };
        });

        return transactionsWithRenamedDateField
    }

    async findUniqueTransaction(id: number) {
        const transaction = await this.prisma.transacoes.findUnique({
            where: {
                id: id,
            }
        })

        return transaction
    }

    async findSaldo(clientId: number) {
        const saldo = await this.prisma.saldos.findFirst({
            where: {
                cliente_id: clientId
            }
        })

        return saldo
    }

    async updateTransaction(id: number, dataTransaction: UpdateTransactionDto) {
        const transaction = await this.prisma.transacoes.update({
            where: {
                id,
            },
            data: {
                valor: dataTransaction.valor,
                tipo: dataTransaction.tipo,
                descricao: dataTransaction.descricao,
                cliente_id: parseInt(dataTransaction.cliente_id),
            }
        })

        return transaction
    }

    async deleteTransaction(id: number) {
        const transaction = await this.prisma.transacoes.delete({
            where: {
                id,
            }
        })
    }
}