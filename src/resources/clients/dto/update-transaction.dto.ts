export interface UpdateTransactionDto {
    valor?: number;
    tipo?: 'c' | 'd';
    descricao?: string;
    client_id?: string;
}