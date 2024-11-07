import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { ExpenseName } from '../../models/expense-set/expense-set.model';
import { SubmittedTransactionsComponent } from '../../component/upload-statement/submitted-transactions/submitted-transactions.component';

@Component({
  selector: 'app-check-row-table',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CommonModule,
  ],
  templateUrl: './check-row-table.component.html',
  styleUrl: './check-row-table.component.css'
})
export class CheckRowTableComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public expenseNameList: ExpenseName[],
    @Optional() public dialogRef: MatDialogRef<SubmittedTransactionsComponent>,
  ) { }

  onDuplicateRowClick(duplicateName: string): void {
    const rowCheckboxElement = (document.getElementById(duplicateName) as HTMLInputElement);
    if(rowCheckboxElement){
      rowCheckboxElement.checked = !rowCheckboxElement.checked;
    }
  }
}
