import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Debit } from '../models/debit.model';

@Injectable({
  providedIn: 'any'
})
export class DebitService {
  private BASE_URL: string = "http://localhost:8080/debits";
  
  constructor(private http: HttpClient) { }

  getAllDebits(): Observable<Debit[]> {
    return this.http.get<Debit[]>(this.BASE_URL);
  }

  createDebit(debit: Debit): Observable<Debit> {
    return this.http.post<Debit>(this.BASE_URL, debit);
  }
}
