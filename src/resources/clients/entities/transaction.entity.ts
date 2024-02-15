export interface TransactionEntity {
    id?: string;
    valor: number;
    tipo: 'c' | 'd';
    descricao: string;
    cliente_id: string;
    realizada_em: Date;
}