import { CommonModule, KeyValuePipe } from '@angular/common';
import {} from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { DebitService } from '../../services/debit.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NewCategoryComponent } from '../../dialog/new-category/new-category.component';
import { emptyTransaction, Transaction } from '../../models/transaction.model';
import * as Papa from 'papaparse';
import { Modal } from 'bootstrap';
import { SubmittedTransactionsComponent } from '../../dialog/submitted-transactions/submitted-transactions.component';

@Component({
  selector: 'app-upload-statement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './upload-statement.component.html',
  styleUrl: './upload-statement.component.css'
})
export class UploadStatementComponent {

  
  fileForm!: FormGroup;

  csvData: any[] = [];
  dbEntries: any[] = [];

  dbCategories: string[] = [];
  defaultCategories: string[] = [
    "Groceries",
    "Home",
    "Car",
    "Work",
    "Restaurant",
    "Transfers",
    "Internal",
    "Game",
    "Fun",
    "Pets",
    "Online Shopping",
    "Health",
    "Clothes",
    "Taxes"
  ];

  dbAccounts: string[] = [];

  newEntries: Transaction[] = [];
  recognizedNewEntries: Transaction[] = [];
  duplicateNewEntries: Transaction[] = [];

  
  //transactionSets has structure { entryFirstWord: string = intersection of all names with same first word}
  transactionSets: any = {}; //[[unique first word], [common substring]]
  transactionSetsKeys: string[] = [];
  uniqueDbNames: string[] = [];

  selectedAccount: string = "";
  newAccountName: string = "";

  selectedTransactionSet: string[] = [];
  selectedTransactionSetName: string = "";

  file: any;

  fileProcessed: boolean = false;

  //Statement type flags
  isCibcFile: boolean = false;
  isTdDebitFile: boolean = false;
  isRogersFile: boolean = false;
  

  //init

  constructor(
    private transactionService: TransactionService,
    private debitService: DebitService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { 
    this.fileForm = formBuilder.group({
      fileInput: [
        null,
        [
          Validators.required
        ]
      ],
      accountSelect: [
        null,
        [
          Validators.required
        ]
      ]
    })
  }

  ngOnInit(){
    this.loadCategories();
    this.loadAccounts();
    this.loadEntries();
  }

  loadCategories(): void {
    this.transactionService.getCategories().subscribe(
      (categories) => {
        this.dbCategories = [...new Set([...categories, ...this.defaultCategories])];

        this.dbCategories.sort();

      }
    );
  }

  loadAccounts(): void {
    this.transactionService.getAccounts().subscribe(
      (accounts) => {
        this.dbAccounts = accounts;
        this.dbAccounts.sort();
      }
    );
  }
  
  loadEntries(): void {
    //calls the right service and fills dbEntries
    this.dbEntries = [];

    this.transactionService.getAllTransactions().subscribe(
      (trans: Transaction[]) => {
        this.dbEntries = trans;
        this.findUniqueDbNames();
      }
    );
  }

  findUniqueDbNames(): void{
    //populates uniqueDbNames
    this.uniqueDbNames = [];

    for(let entry of this.dbEntries){
      if(!this.uniqueDbNames.includes(entry.name)){
        this.uniqueDbNames.push(entry.name);
      }
    }
  }

  //Process Flow
  //User uploads file, triggering: onFileUpload -> loadEntries -> findUniqueDbNames
  //User clicks Process File, triggering: readCsv -> makeEntries
  //User clicks Submit, triggering: submitStatement -> fillCategores,saveEntries


  //START File Upload Flow
  onFileSelected(event: any): void {
    this.csvData = [];
    this.dbEntries = [];
    this.newEntries = [];
    this.transactionSets = [[],[]]; //[[unique first word], [common substring]]
    this.uniqueDbNames = [];

    this.file = event.target.files[0];

    this.isTdDebitFile = false;
    this.isCibcFile = false;
    this.isRogersFile = false;
    
    this.fileProcessed = false;

    if (this.file) {
      const fileName: string = event.target.files[0].name;

      if(fileName.indexOf("cibc") > -1){
        this.isCibcFile = true;
      }
      else if(fileName.indexOf("accountactivity") > -1){
        this.isTdDebitFile = true;
      }
      else if(fileName.indexOf("Transaction") > -1
              && fileName.indexOf("History") > -1){
        this.isRogersFile = true;
      }
      else{
        alert("File account not recognized");
      }
    }
    this.loadEntries();
  }
  
  newAccountButton(): void {
    this.newAccountName = "";

    const newAccModalElement = <HTMLElement> document.getElementById("newAccountModal");
    const newAccModal = new Modal(newAccModalElement);
    newAccModal.show();
  }

  saveNewAccount(): void {
    this.dbAccounts.push(this.newAccountName);
    setTimeout(() => {
      const newAccountSelectOption = <HTMLOptionElement> document.getElementById(this.newAccountName);
      if(newAccountSelectOption){
        newAccountSelectOption.selected = true;
      }
      else{
        console.error("New Account option element not found.")
      }
    }, 300);
    this.selectedAccount = this.newAccountName;
  }

  //START Process File Flow

  readCsv(): void{
    // Use FileReader to read the file into csvData
    this.csvData = [];
    var fileHeadings: boolean = false;

    const reader = new FileReader();
    reader.readAsText(this.file);

    reader.onload = () => {
      const csvText = reader.result as string;

      // Parse CSV using PapaParse
      Papa.parse(csvText, {
        complete: (result) => {
          this.csvData = result.data;
          this.makeNewEntries();
          // this.makeTransactionSets();
          this.fileProcessed = true;
        },
        header: false  // Set to true if CSV has headers
      });
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    setTimeout(() => {
      const tableElement = document.getElementById("statement-table");
      if(tableElement){
        tableElement.scrollIntoView({block: 'start', behavior:'smooth'});
      }
    }, 100);
  }
  
  makeNewEntries(): void{
    //sets newEntries from csvData
    //makes transactionSets when name not found in db
    this.newEntries = [];
    this.transactionSets = {};
    this.transactionSetsKeys = [];

    //removes empty entry at the end
    this.csvData.splice(this.csvData.length - 1, 1);

    //remove headers from Rogers files
    if(this.isRogersFile){
      this.csvData.splice(0, 1);
    }

    for(let i = this.csvData.length - 1; i > -1; i--){

      let newEntry: Transaction = emptyTransaction();
      let balanceChange: number = 0;

      //this decides whether the entry is an loss or a gain
      //only for Cibc and TdDebit
      if(this.csvData[i][2]){
        balanceChange = parseFloat(this.csvData[i][2]) * -1;
      }
      else{
        balanceChange = parseFloat(this.csvData[i][3]);
      }


      if(this.isCibcFile){
        var transName = this.csvData[i][1];
        const splitNameList = transName.split(" ").slice(0, -2);
        if(splitNameList.length > 0){
          transName = splitNameList.join(" ");
        }

        newEntry = {
          date: this.csvData[i][0],
          name: transName,
          amount: balanceChange,
          yyyymm: this.csvData[i][0].substring(0,7),
          category: "",
          account: this.selectedAccount,
        };
      }
      else if(this.isTdDebitFile){
        var dateParts = this.csvData[i][0].split("/")
        var formattedDate: string = dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1];
        newEntry = {
          date: formattedDate,
          name: this.csvData[i][1],
          amount: balanceChange,
          yyyymm: formattedDate.substring(0,7),
          category: "",
          account: this.selectedAccount,
        };
      }
      else if(this.isRogersFile){
        //rogers files handle negative values as gains
        newEntry = {
          date: this.csvData[i][0],
          name: this.csvData[i][7],
          amount: -1 * parseFloat(this.csvData[i][12].replace("$", '').replace(",","")),
          yyyymm: this.csvData[i][0].substring(0,7),
          category: "",
          account: this.selectedAccount,
        }
      }

      
      //if the entry is in database, put into recognized or duplicate new entries
      //otherwise create a selectedTransactionSet
      if(this.uniqueDbNames.includes(newEntry.name)){
        var match = this.dbEntries.filter( val => {
          return val.name == newEntry.name &&
                  val.date == newEntry.date &&
                  val.amount == newEntry.amount;
        });
        console.log(match);
        console.log(newEntry);
        if(match.length != 0){
          this.duplicateNewEntries.push(newEntry);
        }
        else{
          newEntry.category = this.dbEntries.find(t => t.name === newEntry.name)?.category;
          this.recognizedNewEntries.push(newEntry);
        }
      }
      else{
        this.newEntries.push(newEntry);
        this.makeTransactionSet(newEntry);
      }
    }
    
    this.transactionSetsKeys = Object.keys(this.transactionSets)

    if(this.duplicateNewEntries.length !=0){
      this.dialog.open(SubmittedTransactionsComponent, {
        data: {
          duplicateEntries: this.duplicateNewEntries,
        }
      });
    }

  }

  makeTransactionSet(newEntry: Transaction): void{    
    var entryFirstWord: string = newEntry.name.split(" ")[0];

    if(this.transactionSets[entryFirstWord] != undefined){
      this.transactionSets[entryFirstWord] = this.commonSubstring(this.transactionSets[entryFirstWord], newEntry.name);
    }
    else{
      this.transactionSets[entryFirstWord] = newEntry.name;
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


  // Table view

  sumUniqueNewFirstWord(uniqueName: string): number{
    
    var total: number = 0;

    for(let entry of this.newEntries){
      if(entry.name.indexOf(uniqueName) >= 0
          && uniqueName.indexOf(entry.name.split(" ")[0]) >= 0){
        total += entry.amount;
      }
    }
    
    return +total.toFixed(2);
  }

  checkHasMultipleTransactions(uniqueNewFirstWord: string): boolean {
    var uniqueTransactionNames:string[] = [];

    for(let entry of this.newEntries){
      if(entry.name.indexOf(uniqueNewFirstWord) >= 0
          && !uniqueTransactionNames.includes(entry.name)){
        uniqueTransactionNames.push(entry.name);
        if(uniqueTransactionNames.length > 1){ return true;}
      }
    }
    return false;
  }

  //this should be changed to be a dialog which looks like a modal and feeds
  //selectedTransactionSet as a parameter instead of having it global
  splitTransactionSetModal(uniqueNewFirstWord: string): void {
    this.selectedTransactionSet = [];
    this.selectedTransactionSetName = uniqueNewFirstWord;

    for(let entry of this.newEntries){
      if(entry.name.indexOf(uniqueNewFirstWord) >= 0
          && !this.selectedTransactionSet.includes(entry.name)){
        this.selectedTransactionSet.push(entry.name);
      }
    }
    
    const splitTransactionSetModalElement = <HTMLElement> document.getElementById("splitTransactionSetModal");
    const splitTransactionSetModal = new Modal(splitTransactionSetModalElement);
    splitTransactionSetModal.show();
  }

  splitTransaction(): void {
    var transactionSetIndex = this.transactionSets[1].indexOf(this.selectedTransactionSetName);
    this.transactionSets[0].splice(transactionSetIndex,1, ...this.selectedTransactionSet);
    this.transactionSets[1].splice(transactionSetIndex,1, ...this.selectedTransactionSet);

    this.selectedTransactionSet = [];
    this.selectedTransactionSetName = "";
  }

  onCategoryChange(event: any): void {
    const selectElement = (event.target as HTMLSelectElement)

    if(selectElement.value === "new-category"){
      const dialogRef = this.openNewCategoryDialog();

      dialogRef.afterClosed().subscribe(
        newCategory => {//update and sort category list
          if(newCategory != undefined){
            this.dbCategories.push(newCategory);
            this.dbCategories.sort((a, b) => 
              a.localeCompare(b, undefined, { sensitivity: 'base' })
          );
          
          setTimeout(() => {
            selectElement.value = newCategory;
          }, 50);
          }
        }
      );
    }

  }

  createCategoryButton():void {
    const dialogRef = this.openNewCategoryDialog();

    dialogRef.afterClosed().subscribe(
      newCategory => {
        if(newCategory != undefined && newCategory != ""){
          this.dbCategories.push(newCategory);
          this.dbCategories.sort((a, b) => 
            a.localeCompare(b, undefined, { sensitivity: 'base' })
        );
        }
      });
  }

  openNewCategoryDialog(): MatDialogRef<NewCategoryComponent, any> {
    return this.dialog.open(NewCategoryComponent,{
      // width: "400px",
      // height: "300px",
      // autoFocus: false,
    });
  }

  onTransactionDelete(): void {
    
  }

  //START Submit Statement Flow

  showSubmissionModal(): void {
    if (this.fillCategories()) { //check if all categories are filled
      const subModalElement = <HTMLElement> document.getElementById("submissionModal");
      const subModal = new Modal(subModalElement);
      subModal.show();
    }
    else{
      alert("There are empty categories!");
    }
  }

  //must be changed to add categories for duplicate entries with the same name
  fillCategories(): boolean{
    //returns true if all categories are filled
    for(let key of this.transactionSetsKeys){
      const dropdownElement = (<HTMLInputElement>document.getElementById("dropdown" + key));
      if(dropdownElement){
        for(let entry of this.newEntries){
          if(entry.name.indexOf(this.transactionSets[key]) === 0){
            entry.category = dropdownElement.value;
          }
        }
      }
    }

    //check for entries with empty category
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

    for(let transaction of this.newEntries){
      this.transactionService.createTransaction(transaction as Transaction).subscribe();
    }
  }
  //END Submit Statement Flow


}
