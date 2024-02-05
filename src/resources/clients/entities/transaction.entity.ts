export interface TransactionEntity {
    valor: number;
    tipo: 'c' | 'd';
    descricao: string;
    client_id: string;
}