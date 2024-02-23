import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma-service";
import { TransactionEntity } from "../../entities/transaction.entity";
import { clientsRepository } from "../client.repository";


const clients = [{
    id: 1,
    saldo_id: 1,
    nome: 'o barato sai caro',
    limite: 100000
},
{
    id: 2,
    saldo_id: 2,
    nome: 'zan corp ltda',
    limite: 80000
},
{
    id: 3,
    saldo_id: 3,
    nome: 'les cruders',
    limite: 1000000
},
{
    id: 4,
    saldo_id: 4,
    nome: 'padaria joia de cocaia',
    limite: 10000000
},
{
    id: 5,
    saldo_id: 5,
    nome: 'kid mais',
    limite: 500000
}];

@Injectable()
export class PrismaClientsRepository implements clientsRepository {
    constructor(private prisma: PrismaService) { }

    async findUnique(id: number) {
        return id > 0 && id < 6 ? clients[id - 1] : null;
    }

    async atualizaSaldo2(idSaldo: number, limite: number, valor: number, tipo: 'c' | 'd') {
        const query = `
                UPDATE saldos
                SET valor = valor + ${tipo === 'd' ? -Math.abs(valor) : Math.abs(valor)}
                WHERE id = ${idSaldo}
                AND (ABS(valor - ${Math.abs(valor)}) < ${limite} OR '${tipo}' = 'c')
                RETURNING *;
            `;

        return await this.prisma.$queryRawUnsafe(query);
    }


    async createTransaction(id: number, data: TransactionEntity) {
        const client = clients[id - 1];


        const valSaldo = await this.atualizaSaldo2(client.saldo_id, client.limite, data.valor, data.tipo)

        if ((!valSaldo || !Array.isArray(valSaldo)) || (Array.isArray(valSaldo) && valSaldo.length === 0)) {
            throw new HttpException('Limite Excedido', 422)
        }

        await this.prisma.transacoes.create({
            data: {
                valor: data.valor,
                tipo: data.tipo,
                descricao: data.descricao.substring(0, 9),
                cliente_id: id,
            },
        })

        return {
            limite: client.limite,
            saldo: valSaldo[0].valor,
        };
    }

    async findAllClientTransactions(id: number) {
        return this.prisma.$transaction(async (prisma) => {
            const clientTransactions = await prisma.transacoes.findMany({
                where: {
                    cliente_id: id,
                },
                orderBy: {
                    realizada_em: 'desc'
                },
                take: 10,
                select: {
                    valor: true,
                    tipo: true,
                    descricao: true,
                    realizada_em: true
                }
            });

            return clientTransactions;
        });
    }
    async findSaldo(id: number) {
        const saldo = await this.prisma.saldos.findUnique({
            where: {
                id,
            }
        })

        return saldo
    }
}

