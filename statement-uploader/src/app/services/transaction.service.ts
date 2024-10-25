import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'any'
})
export class TransactionService {
  private BASE_URL: string = "http://localhost:8080/transactions";
  
  constructor(private http: HttpClient) { }

  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.BASE_URL);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.BASE_URL, transaction);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.BASE_URL}/categories`);
  }

  getAccounts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.BASE_URL}/accounts`);
  }

  updateTransactionNameCategory(transaction: Transaction): Observable<Transaction[]> {
    return this.http.put<Transaction[]>(this.BASE_URL, transaction)
  }
}
