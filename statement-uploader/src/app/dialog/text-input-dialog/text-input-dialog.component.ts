import { Component, Inject, input, Optional } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-text-input-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogContent,
    ReactiveFormsModule
  ],
  templateUrl: './text-input-dialog.component.html',
  styleUrl: './text-input-dialog.component.css'
})
export class TextInputDialogComponent {

  textForm!: FormGroup;

  inputText: string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data : {
      title: string,
      label: string
    },
    @Optional() public dialogRef: MatDialogRef<TextInputDialogComponent>,
    public formBuilder: FormBuilder,
  ){
    this.textForm = formBuilder.group({
      inputText: [
        null,
        [Validators.required]
      ]
    })
  }

  emitInput():void {
    var inputTextElement = this.textForm.get('inputText')
    if(inputTextElement){
      this.dialogRef.close(inputTextElement.value);
    }
    else{
      console.error("Error accessing form input, returning empty string");
      this.dialogRef.close("");
    }
  }

}
