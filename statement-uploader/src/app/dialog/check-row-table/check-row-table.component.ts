import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Expense, ExpenseName } from '../../models/expense-set/expense-set.model';
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

  action: string = "Delete";
  checkedExpenseNameList: ExpenseName[] = [];

  
  constructor(
    @Inject(MAT_DIALOG_DATA) public expenseNameList: ExpenseName[],
    @Optional() public dialogRef: MatDialogRef<CheckRowTableComponent>,
  ) { }

  onDuplicateRowClick(expenseName: ExpenseName, expenseIndex: number): void {
    const rowCheckboxElement = (document.getElementById(expenseName.name + expenseIndex) as HTMLInputElement);
    if(rowCheckboxElement){
      // if(rowCheckboxElement.checked){

      // }

      rowCheckboxElement.checked = !rowCheckboxElement.checked;
    }
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }

  onSelected(): void {
    var remainingExpenseNameList: ExpenseName[] = [];
    var uncheckedExpense: boolean = false;

    for(let expenseName of this.expenseNameList){
      var isNameCreated = false;
      expenseName.expenseList.forEach((expense, i) => {
        const rowCheckboxElement = (document.getElementById(expenseName.name + i) as HTMLInputElement);
        if(rowCheckboxElement){
          if(rowCheckboxElement.checked){
            // if(!isNameCreated){
            //   remainingExpenseNameList.push({
            //     name: expenseName.name,
            //     expenseList: [expense]
            //   });
            //   isNameCreated = true;
            // }
            // else{
            //   remainingExpenseNameList.at(remainingExpenseNameList.length - 1)?.expenseList.push(expense);
            // }
          }
          else{
            if(!isNameCreated){
              remainingExpenseNameList.push({
                name: expenseName.name,
                expenseList: [expense]
              });
              isNameCreated = true;
            }
            else{
              remainingExpenseNameList.at(remainingExpenseNameList.length - 1)?.expenseList.push(expense);
            }
            uncheckedExpense = true;
          }
        }
      })
      // for(let i = 0; i < expenseName.expenseList.length; i++){
      //   const rowCheckboxElement = (document.getElementById(expenseName.name + i) as HTMLInputElement);
      //   if(rowCheckboxElement){
      //     if(rowCheckboxElement.checked){
      //       var foundExpense: Expense | undefined = expenseName.expenseList.at(i);
      //       if(foundExpense != undefined){
      //         if(!isNameCreated){
      //           remainingExpenseNameList.push({
      //             name: expenseName.name,
      //             expenseList: [foundExpense]
      //           })
      //         }
      //         else{
      //           remainingExpenseNameList.at(remainingExpenseNameList.length - 1)?.expenseList.push(foundExpense);
      //         }
      //       }
      //       else{
      //         console.error("Error finding expense");
      //       }
      //     }
      //   }
      // }
    }

    if(uncheckedExpense){
      this.dialogRef.close(remainingExpenseNameList);
    }
    else{
      this.dialogRef.close([]);
    }
  }

  onAll(): void {
    this.dialogRef.close([]);
  }
}
