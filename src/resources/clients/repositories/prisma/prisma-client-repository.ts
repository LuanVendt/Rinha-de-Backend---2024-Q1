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

    async findUnique(id: string) {
        const client = await this.prisma.clientes.findUnique({
            where: {
                id: parseInt(id),
            }
        })

        return client
    }

    async update(id: string, dataClient: UpdateClientDto) {
        const client = await this.prisma.clientes.update({
            where: {
                id: parseInt(id),
            },
            data: {
                nome: dataClient.nome,
                limite: dataClient.limite,
            }
        })

        return client
    }

    async delete(id: string) {
        await this.prisma.transacoes.deleteMany({
            where: {
                client_id: parseInt(id),
            }
        })

        await this.prisma.saldos.deleteMany({
            where: {
                cliente_id: parseInt(id)
            }
        })

        await this.prisma.clientes.delete({
            where: {
                id: parseInt(id),
            }
        })
    }

    async createTransaction(id: string, data: TransactionEntity) {
        // Busca o limite de crédito do cliente
        const { limite } = await this.prisma.clientes.findUnique({
            where: {
                id: parseInt(id),
            }
        });

        // Verifica se a transação é do tipo débito
        if (data.tipo === "d") {
            // Verifica se o valor da transação ultrapassa o limite de crédito
            const { valor: saldoAtual } = await this.prisma.saldos.findUnique({
                where: {
                    id: parseInt(id)
                },
            });

            const novoSaldo = saldoAtual - data.valor;

            if (novoSaldo < 0 && Math.abs(novoSaldo) > limite) {
                throw new BadRequestException('Limite excedido.');
            }
        }

        // Cria a transação no banco de dados
        const transaction = await this.prisma.transacoes.create({
            data: {
                valor: data.valor,
                tipo: data.tipo,
                descricao: data.descricao,
                client_id: parseInt(id),
            }
        });

        // Atualiza o saldo do cliente com base na transação
        await this.prisma.saldos.update({
            where: {
                cliente_id: parseInt(id),
            },
            data: {
                valor: {
                    // Adiciona ou subtrai o valor da transação do saldo atual
                    increment: data.tipo === "c" ? data.valor : -data.valor
                }
            }
        });

        // Retorna o saldo atualizado
        const { valor: saldoAtualizado } = await this.prisma.saldos.findUnique({
            where: {
                id: parseInt(id)
            },
        });

        return {
            limite,
            saldo: saldoAtualizado,
        };
    }


    async findAllClientTransactions(id: string) {
        const clientTransactions = await this.prisma.transacoes.findMany({
            where: {
                client_id: parseInt(id),
            },
            orderBy: {
                realizada_em: 'desc'
            },
            take: 10
        })

        const transactionsWithRenamedDateField = clientTransactions.map(transaction => {
            // Remover o campo 'id' de cada transação
            const { id, ...transactionWithoutId } = transaction;
            return {
                ...transactionWithoutId,
                realizada_em: transaction.realizada_em, // Renomeando o campo date para realizada_em
                date: undefined // Removendo o campo date original
            };
        });

        return transactionsWithRenamedDateField
    }

    async findUniqueTransaction(id: string) {
        const transaction = await this.prisma.transacoes.findUnique({
            where: {
                id,
            }
        })

        return transaction
    }

    async findSaldo(clientId: string) {
        const saldo = await this.prisma.saldos.findUnique({
            where: {
                cliente_id: parseInt(clientId)
            }
        })

        return saldo
    }

    async updateTransaction(id: string, dataTransaction: UpdateTransactionDto) {
        const transaction = await this.prisma.transacoes.update({
            where: {
                id,
            },
            data: {
                valor: dataTransaction.valor,
                tipo: dataTransaction.tipo,
                descricao: dataTransaction.descricao,
                client_id: parseInt(dataTransaction.client_id),
            }
        })

        return transaction
    }

    async deleteTransaction(id: string) {
        const transaction = await this.prisma.transacoes.delete({
            where: {
                id,
            }
        })
    }
}