export interface UpdateTransactionDto {
    valor?: number;
    tipo?: 'c' | 'd';
    descricao?: string;
    cliente_id?: string;
}