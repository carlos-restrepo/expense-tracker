import { Transaction } from "./transaction.model";

export interface Debit extends Transaction{
  balance: number;
}