import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Debit } from '../../models/debit.model';
import { TransactionService } from '../../services/transaction.service';
import { DebitService } from '../../services/debit.service';
import { MatDialog } from '@angular/material/dialog';
import { NewCategoryComponent } from '../../dialog/new-category/new-category.component';
import { Transaction } from '../../models/transaction.model';
import * as Papa from 'papaparse';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-upload-statement',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    CanvasJSAngularChartsModule,
  ],
  templateUrl: './upload-statement.component.html',
  styleUrl: './upload-statement.component.css'
})
export class UploadStatementComponent {
  

  csvData: any[] = [];
  dbEntries: any[] = [];
  newEntries: any[] = [];
  uniqueNewFirstWords: Array<Array<string>> = [[],[]]; //[[unique first word], [common substring]]
  uniqueDbNames: string[] = [];
  uniqueCategories: string[] = [];

  file: any;
  fileReady: boolean = false;

  fileProcessed: boolean = false;

  //Statement type flags
  transactionFile: boolean = false;
  debitFile: boolean = false;
  
  constructor(
    private transactionService: TransactionService,
    private debitService: DebitService,
    private dialog: MatDialog,
  ) { }

  //Process Flow
  //User uploads file, triggering: onFileUpload -> loadEntries -> findUniqueDbNames
  //User clicks Process File, triggering: readCsv -> makeEntries
  //User clicks Submit, triggering: submitStatement -> fillCategores,saveEntries

  logAll(){
    console.log(this.uniqueNewFirstWords);
  }

  enableProcessing(event:any):void {
    if(event.srcElement.value){
      this.fileReady = true;
    }
  }

  createCategoryButton():void {
    const dialogRef = this.dialog.open(NewCategoryComponent,{
      width: "400px",
      height: "300px",
    });

    dialogRef.afterClosed().subscribe(
      newCategory => {
        if(newCategory != undefined){
          this.uniqueCategories.push(newCategory);
          this.uniqueCategories.sort();
        }
      });
  }

  ngOnInit(){
    this.transactionService.getCategories().subscribe(
      (categories) => {
        this.uniqueCategories = categories;
        this.uniqueCategories.sort(
          (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      }
    );

  }

  //START File Upload Flow
  onFileSelected(event: any): void {
    this.csvData = [];
    this.dbEntries = [];
    this.newEntries = [];
    this.uniqueNewFirstWords = [[],[]]; //[[unique first word], [common substring]]
    this.uniqueDbNames = [];

    this.file = event.target.files[0];
    this.debitFile = false;
    this.transactionFile = false;
    this.fileProcessed = false;

    if (this.file) {
      const fileName: string = event.target.files[0].name;

      if(fileName.includes("cibc")){
        this.transactionFile = true;
        this.fileReady = true;
      }
      else if(fileName.includes("accountactivity")){
        this.debitFile = true;
      }
      else{
        alert("File account not recognized");
      }
    }
    this.loadEntries();
  }
  
  loadEntries(): void {
    //calls the right service and fills dbEntries
    this.dbEntries = [];

    if(this.transactionFile){
      this.transactionService.getAllTransactions().subscribe(
        (trans: Transaction[]) => {
          this.dbEntries = trans;
        }
      );
    }
    else if(this.debitFile){
      this.debitService.getAllDebits().subscribe(
        (debit: Debit[]) => {
          this.dbEntries = debit;
        }
      );
    }
    this.findUniqueDbNames();
  }

  findUniqueDbNames(): void{
    //populates uniqueDbNames
    this.uniqueDbNames = [];

    for(let entry of this.dbEntries){
      if(entry.category){
        if(!this.uniqueCategories.includes(entry.category)){
          this.uniqueCategories.push(entry.category);
        }
      }
      if(!this.uniqueDbNames.includes(entry.name)){
        this.uniqueDbNames.push(entry.name);
      }
    }
  }

  //START Process File Flow

  readCsv(): void{
    // Use FileReader to read the file into csvData
    this.csvData = [];
    const reader = new FileReader();
    reader.readAsText(this.file);

    reader.onload = () => {
      const csvText = reader.result as string;

      // Parse CSV using PapaParse
      Papa.parse(csvText, {
        complete: (result) => {
          this.csvData = result.data;
          this.makeNewEntries();
          this.makeUniqueNewFirstWords();
          this.fileProcessed = true;
        },
        header: false  // Set to true if CSV has headers
      });
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
  }

  makeNewEntries(): void{
    //sets newEntries from csvData
    this.newEntries = [];

    //removes empty entry at the end
    this.csvData.splice(this.csvData.length - 1, 1);

    //Should be upgraded to check if first word of new transaction matches first word of present uniqueDbNames
    for(let i = this.csvData.length - 1; i > -1; i--){

      let newEntry: any;
      let balanceChange: number = 0;

      //this decides whether the entry is an loss or a gain
      if(this.csvData[i][2]){
        balanceChange = parseFloat(this.csvData[i][2]) * -1;
      }
      else{
        balanceChange = parseFloat(this.csvData[i][3]);
      }


      if(this.transactionFile){
        newEntry = {
          date: this.csvData[i][0],
          name: this.csvData[i][1],
          amount: balanceChange,
          yyyymm: this.csvData[i][0].substring(0,7),
          category: "",
          account: "cibc",
        } as Transaction;
      }
      else if(this.debitFile){
        const debitAccount: string = (<HTMLInputElement>document.getElementById("accountSelect")).value;
        var dateParts = this.csvData[i][0].split("/")
        var formattedDate: string = dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1];
        newEntry = {
          date: formattedDate,
          name: this.csvData[i][1],
          amount: balanceChange,
          balance: parseFloat(this.csvData[i][4]),
          yyyymm: formattedDate.substring(0,7),
          category: "",
          account: debitAccount,
        } as Debit;
      }
      if(this.uniqueDbNames.includes(this.csvData[i][1])){
        newEntry.category = this.dbEntries.find(t => t.name === this.csvData[i][1])?.category;
      }
      this.newEntries.push(newEntry);
    }
  }
  
  makeUniqueNewFirstWords(): void{
    //sets uniqueNewFirstWords
    //sets uniqueNewNameEntries

    this.uniqueNewFirstWords = [[],[]];
    var uniqueNewNameEntries = [];

    for(let entry of this.newEntries){
      if(!uniqueNewNameEntries.map( e => e.name).includes(entry.name)){
        if(!this.uniqueDbNames.includes(entry.name)){
          uniqueNewNameEntries.push(entry);
          
          var entryFirstWord: string = entry.name.split(" ")[0];
          if(this.uniqueNewFirstWords[0].includes(entryFirstWord)){
            var wordIndex = this.uniqueNewFirstWords[0].indexOf(entryFirstWord)
            this.uniqueNewFirstWords[1][wordIndex] = this.commonSubstring(this.uniqueNewFirstWords[1][wordIndex], entry.name);
          }
          else{
            this.uniqueNewFirstWords[0].push(entryFirstWord);
            this.uniqueNewFirstWords[1].push(entry.name);
          }
        }
      }
    }


  }

  commonSubstring(str1: string, str2: string) {
    let common = "";
  
    for (let i = 1; i <= Math.min(str1.length, str2.length); i++) {
      if (str2.startsWith(str1.substring(0, i))) {
        common = str1.substring(0, i);
      } else {
        break;
      }
    }
    
    return common;
  }

  sumUniqueNewFirstWord(uniqueName: string): number{
    
    var total: number = 0;

    for(let entry of this.newEntries){
      if(entry.name.indexOf(uniqueName) >= 0){
        total += entry.amount;
      }
    }
    
    return +total.toFixed(2);
  }

  //START Submit Statement Flow

  submitStatement(): void {

    //check if all categories are filled
    
    if (this.fillCategories()) { //check if all categories are filled

      this.saveEntries();
      const subModalElement = <HTMLElement> document.getElementById("submissionModal");
      const subModal = new Modal(subModalElement)
      subModal.show();
    }
    else{
      alert("There are empty categories!");
    }
  }

  //must be changed to add categories for duplicate entries with the same name
  fillCategories(): boolean{
    //returns true if all categories are filled
    for(let i=0; i < this.uniqueNewFirstWords[1].length;i++){
      //get element and
      const dropdownElement = (<HTMLInputElement>document.getElementById("dropdown " + i));
      if(dropdownElement){
        for(let entry of this.newEntries){
          if(entry.name.split(" ")[0] === this.uniqueNewFirstWords[0][i]){
            entry.category = dropdownElement.value;
          }
        }
      }
    }

    for(let entry of this.newEntries){
      if(entry.category == ''){ return false;}
    }
    return true;
  }

  //Could double check received transactions match uploaded ones.
  //Should send bulk and handle for loop in backend
  saveEntries(): void {

    this.newEntries.sort((a,b) => {
      return a.date < b.date? -1: 1;
    })


    if(this.debitFile){
      for(let debit of this.newEntries){
        this.debitService.createDebit(debit as Debit).subscribe();
      }
    }
    else if(this.transactionFile){
      for(let transaction of this.newEntries){
        this.transactionService.createTransaction(transaction as Transaction).subscribe();
      }
    }
    alert("Uploaded statement!");
  }
  //END Submit Statement Flow


}
