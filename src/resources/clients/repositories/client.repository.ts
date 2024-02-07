import { QueryClientsDto } from "../dto/query-client.dto";
import { UpdateClientDto } from "../dto/update-client.dto";
import { UpdateTransactionDto } from "../dto/update-transaction.dto";
import { ClientEntity } from "../entities/client.entity";
import { TransactionEntity } from "../entities/transaction.entity";

export abstract class clientsRepository {
    abstract create(data: ClientEntity): Promise<ClientEntity>
    abstract createTransaction(id: string, data: TransactionEntity): Promise<any>
    abstract findAll(query: QueryClientsDto): Promise<any>
    abstract findAllClientTransactions(id: string): Promise<any>
    abstract findSaldo(clientId: string): Promise<any>
    abstract findUnique(id: string): Promise<ClientEntity>
    abstract findUniqueTransaction(id: string): Promise<any>
    abstract update(id: string, dataClient: UpdateClientDto): Promise<UpdateClientDto>
    abstract updateTransaction(id: string, dataTransaction: UpdateTransactionDto): Promise<any>
    abstract delete(id: string): Promise<void>
    abstract deleteTransaction(id: string): Promise<void>
}