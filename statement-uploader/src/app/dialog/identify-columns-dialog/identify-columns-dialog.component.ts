import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { ExpenseName } from '../../models/expense-set/expense-set.model';
import { SubmittedTransactionsComponent } from '../../component/upload-statement/submitted-transactions/submitted-transactions.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-identify-columns-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './identify-columns-dialog.component.html',
  styleUrl: './identify-columns-dialog.component.css'
})
export class IdentifyColumnsDialogComponent {

  rowLength: number;
  columnForm!: FormGroup;
  columnIndeces: any = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public csvRows: any[],
    @Optional() public dialogRef: MatDialogRef<SubmittedTransactionsComponent>,
    private formBuilder: FormBuilder,
  ) {
    this.rowLength = csvRows[0].length;

    var formBuilderConfig: any = {};
    for(let i = 0; i < this.rowLength; i++){
      formBuilderConfig[`columnSelect${i}`] = [null,[]];
    }
    this.columnForm = formBuilder.group(formBuilderConfig);

    this.initColumnIndeces();
  }

  initColumnIndeces(): void {
    this.columnIndeces = {
      date: -1,
      name: -1,
      gain: -1,
      loss: -1
    };
  }

  onCancel(): void {
    this.initColumnIndeces();
    this.dialogRef.close(this.columnIndeces);
  }

  onSubmit(): void {

    var isValidColumns = this.validateSelectedColumns();
    if(isValidColumns){
      this.dialogRef.close(this.columnIndeces);
    }
    else{
      this.initColumnIndeces();
      for(let col = 0; col < this.rowLength; col++){
        var columnSelectField = this.columnForm.get(`columnSelect${col}`)?.setValue(null);
      }
      alert('Invalid columns!');
    }
  }

  /**
   * Returns empty list if the wrong columns are selected.
   * Otherwise returns a list with the column number in the order:
   * [date,name,gain,loss].
   * When gain and loss are in the same column gain and loss are equal.
   */
  validateSelectedColumns(): boolean {
    
    for(let col = 0; col < this.rowLength; col++){
      var columnSelectField = this.columnForm.get(`columnSelect${col}`);
      if(columnSelectField){
        var fieldValue = columnSelectField.value;
        //unselected fields have value -1
        if(fieldValue != undefined){
          if(fieldValue === 'gainloss'){
            if(this.columnIndeces.gain > -1 || this.columnIndeces.loss > -1){
              return false;
            }
            else{
              this.columnIndeces.gain = col;
              this.columnIndeces.loss = col;
            }
          }
          else{
            if(this.columnIndeces[fieldValue] > -1){
              return false;
            }
            else{
              this.columnIndeces[fieldValue] = col;
            }
          }
        }
      }
    }

    for(let key of Object.keys(this.columnIndeces)){
      if(this.columnIndeces[key] == -1){
        return false;
      }
    }

    return true;
  }

  onRowClick(index: number): void {
    const rowCheckboxElement = (document.getElementById(index.toString()) as HTMLInputElement);
    if(rowCheckboxElement){
      rowCheckboxElement.checked = !rowCheckboxElement.checked;
    }
  }
}
