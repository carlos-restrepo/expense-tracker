import { DialogRef } from '@angular/cdk/dialog';
import { Component, Optional } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatDialog, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { dialog } from 'electron';

@Component({
  selector: 'app-new-category',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogContent,
  ],
  templateUrl: './new-category.component.html',
  styleUrl: './new-category.component.css'
})
export class NewCategoryComponent {

  categoryForm!: FormGroup;

  newCategory: string = "";

  constructor(
    @Optional() public dialogRef: MatDialogRef<NewCategoryComponent>,
  ){}

  emitCategory():void {
    this.dialogRef.close(this.newCategory);
  }

}
