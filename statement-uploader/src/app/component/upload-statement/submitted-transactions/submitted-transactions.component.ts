import { Component, Inject, Optional } from '@angular/core';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ExpenseName } from '../../../models/expense-set/expense-set.model';

@Component({
  selector: 'app-submitted-transactions',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CommonModule,
  ],
  templateUrl: './submitted-transactions.component.html',
  styleUrl: './submitted-transactions.component.css'
})
export class SubmittedTransactionsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public duplicateExpenseNames: ExpenseName[],
    @Optional() public dialogRef: MatDialogRef<SubmittedTransactionsComponent>,
  ) { }

  onDuplicateRowClick(duplicateName: string): void {
    const rowCheckboxElement = (document.getElementById(duplicateName + "Duplicate") as HTMLInputElement);
    if(rowCheckboxElement){
      rowCheckboxElement.checked = !rowCheckboxElement.checked;
    }
  }

}
