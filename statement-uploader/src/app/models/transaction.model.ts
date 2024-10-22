export interface Transaction {
    id?: number;
    date: string;
    name: string;
    amount: number;
    yyyymm: string;
    category: string;
    account: string;
}