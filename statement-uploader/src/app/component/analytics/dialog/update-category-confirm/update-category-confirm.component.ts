import { Component, inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';


export interface DialogData {
  name: string;
  category: string;
  newCategory: string;
}


@Component({
  selector: 'app-update-category-confirm',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatButtonModule
  ],
  templateUrl: './update-category-confirm.component.html',
  styleUrl: './update-category-confirm.component.css'
})
export class UpdateCategoryConfirmComponent {

  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  

  constructor(
    @Optional() public dialogRef: MatDialogRef<UpdateCategoryConfirmComponent>,
  ){}

  onClose(save: boolean){
    this.dialogRef.close(save);
  }
}
