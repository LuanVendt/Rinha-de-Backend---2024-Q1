import { QueryClientsDto } from "../dto/query-client.dto";
import { UpdateClientDto } from "../dto/update-client.dto";
import { ClientEntity } from "../entities/client.entity";

export abstract class clientsRepository {
    abstract create(data: ClientEntity): Promise<ClientEntity>
    abstract findAll(query: QueryClientsDto): Promise<any>
    abstract findUnique(id: string): Promise<ClientEntity>
    abstract update(id: string, dataClient: UpdateClientDto): Promise<UpdateClientDto>
    abstract delete(id: string): Promise<void>
}