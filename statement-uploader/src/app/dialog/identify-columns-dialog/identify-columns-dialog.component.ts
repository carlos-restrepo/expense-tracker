import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { ExpenseName } from '../../models/expense-set/expense-set.model';
import { SubmittedTransactionsComponent } from '../../component/upload-statement/submitted-transactions/submitted-transactions.component';

@Component({
  selector: 'app-identify-columns-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CommonModule,
  ],
  templateUrl: './identify-columns-dialog.component.html',
  styleUrl: './identify-columns-dialog.component.css'
})
export class IdentifyColumnsDialogComponent {

  rowLength: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public csvRows: any[],
    @Optional() public dialogRef: MatDialogRef<SubmittedTransactionsComponent>,
  ) {
    this.rowLength = csvRows[0].length;
  }

  onDuplicateRowClick(index: number): void {
    const rowCheckboxElement = (document.getElementById(index.toString()) as HTMLInputElement);
    if(rowCheckboxElement){
      rowCheckboxElement.checked = !rowCheckboxElement.checked;
    }
  }
}
