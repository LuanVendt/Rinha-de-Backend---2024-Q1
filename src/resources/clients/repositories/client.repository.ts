import { QueryClientsDto } from "../dto/query-client.dto";
import { UpdateClientDto } from "../dto/update-client.dto";
import { UpdateTransactionDto } from "../dto/update-transaction.dto";
import { ClientEntity } from "../entities/client.entity";
import { TransactionEntity } from "../entities/transaction.entity";

export abstract class clientsRepository {
    abstract create(data: ClientEntity): Promise<ClientEntity>
    abstract createTransaction(id: number, data: TransactionEntity): Promise<any>
    abstract findAll(query: QueryClientsDto): Promise<any>
    abstract findAllClientTransactions(id: number): Promise<any>
    abstract findSaldo(clientId: number): Promise<any>
    abstract findUnique(id: number): Promise<ClientEntity>
    abstract findUniqueTransaction(id: number): Promise<any>
    abstract update(id: number, dataClient: UpdateClientDto): Promise<UpdateClientDto>
    abstract updateTransaction(id: number, dataTransaction: UpdateTransactionDto): Promise<any>
    abstract delete(id: number): Promise<void>
    abstract deleteTransaction(id: number): Promise<void>
}