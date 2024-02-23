import { HttpException, Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { clientsRepository } from "./repositories/client.repository";

@Injectable()
export class ClientsService {
    constructor(
        private clientsRepository: clientsRepository,
    ) { }

    async createTransaction(id: string, data: CreateTransactionDto) {
        if (!data.descricao || data.descricao.length > 10) {
            throw new HttpException('Descrição inválida', 422)
        }

        if (data.valor < 0 || data.valor % 1 !== 0) {
            throw new HttpException('Valor inválido', 422)
        }

        if (data.tipo !== 'c' && data.tipo !== 'd') {
            throw new HttpException('Tipo inváido', 422)
        }

        return this.clientsRepository.createTransaction(parseInt(id), data);
    }

    async findAllClientTransactions(id: string) {
        const client = await this.clientsRepository.findUnique(parseInt(id))

        if (!client || (Array.isArray(client) && client.length === 0)) {
            throw new HttpException('Cliente não encontrado.', 404)
        }

        const clientTransactions = await this.clientsRepository.findAllClientTransactions(parseInt(id))

        const saldo = await this.clientsRepository.findSaldo(client.saldo_id)

        const data_extrato = new Date()

        return {
            saldo: {
                total: saldo.valor,
                data_extrato,
                limite: client.limite || 0
            },
            ultimas_transacoes: clientTransactions
        }
    }
}