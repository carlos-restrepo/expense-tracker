export interface Transaction {
    id?: number;
    date: string;
    name: string;
    amount: number;
    yyyymm: string;
    category: string;
    account: string;
}

export function emptyTransaction(): Transaction {
    const emptyTransaction: Transaction = {
        date: '',
        name: '',
        amount: 0,
        yyyymm: '',
        category: '',
        account: ''
    };
    return emptyTransaction;
}