export interface TransactionEntity {
    id?: string;
    valor: number;
    tipo: 'c' | 'd';
    descricao: string;
    client_id: string;
    realizada_em: Date;
}