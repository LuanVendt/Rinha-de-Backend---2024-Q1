import { UpdateTransactionDto } from "../dto/update-transaction.dto";
import { ClientEntity } from "../entities/client.entity";
import { TransactionEntity } from "../entities/transaction.entity";

export abstract class clientsRepository {
    abstract createTransaction(id: number, data: TransactionEntity): Promise<any>
    abstract findAllClientTransactions(id: number): Promise<any>
    abstract findSaldo(clientId: number): Promise<any>
    abstract findUnique(id: number): Promise<ClientEntity>
    abstract findExtract(id: number): Promise<any>
}