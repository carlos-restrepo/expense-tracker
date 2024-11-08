import { CommonModule, KeyValuePipe } from '@angular/common';
import {} from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { DebitService } from '../../services/debit.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewCategoryComponent } from '../../dialog/new-category/new-category.component';
import { emptyTransaction, Transaction } from '../../models/transaction.model';
import * as Papa from 'papaparse';
import { Modal } from 'bootstrap';
import { SubmittedTransactionsComponent } from './submitted-transactions/submitted-transactions.component';
import { errorClipboardViewContainerRequired } from 'ngx-markdown';
import { emptyExpense, emptyExpenseName, emptyExpenseSet, Expense, ExpenseName, ExpenseSet, expenseSetFromExpenseName, expenseSetToTransactionList, findCommonSubstring, insertExpenseNameIntoExpenseSet } from '../../models/expense-set/expense-set.model';
import { DialogRef } from '@angular/cdk/dialog';
import { TextInputDialogComponent } from '../../dialog/text-input-dialog/text-input-dialog.component';
import { CheckRowTableComponent } from '../../dialog/check-row-table/check-row-table.component';
import { IdentifyColumnsDialogComponent } from '../../dialog/identify-columns-dialog/identify-columns-dialog.component';



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

  private _snackBar = inject(MatSnackBar);
  
  fileForm!: FormGroup;

  dbEntries: any[] = [];
  uniqueDbNames: string[] = [];

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

  csvData: any[] = [];

  newExpenseSets: ExpenseSet[] = [];
  recognizedExpenseSets: ExpenseSet[] = [];
  duplicateExpenseNames: ExpenseName[] = [];

  // newEntries: Transaction[] = [];
  // recognizedNewEntries: Transaction[] = [];
  // recognizedNewGroups: ExpenseName[] = [];
  // duplicateNewEntries: Transaction[] = [];

  entriesToSave: Transaction[] = [];

  
  //transactionSets has structure { entryFirstWord: string = intersection of all names with same first word}
  // transactionSets: any = {}; //[[unique first word], [common substring]]
  // transactionSetsKeys: string[] = [];

  // selectedAccount: string = "";
  // newAccountName: string = "";

  selectedSetToSplit: ExpenseSet = emptyExpenseSet();
  selectedSetToSplitNames: string[] = [];

  file: any;

  fileProcessed: boolean = false;

  //Statement type flags
  isCibcFile: boolean = false;
  isTdDebitFile: boolean = false;
  isRogersFile: boolean = false;
  

  //init
  constructor(
    private transactionService: TransactionService,
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

  /**
   * Process Flow
   * User uploads file, triggering: onFileUpload -> loadEntries -> findUniqueDbNames
   * User clicks Process File, triggering: readCsv -> makeEntries
   * User clicks Submit, triggering: submitStatement -> fillCategores,saveEntries
   */

  /**
   * 
   * GPT Recommendation Panel
   */

  chatgptSnackbar(): void {
    this._snackBar.open(
      'You can take a screenshot of your statement then visit chatgpt.com and paste the screenshot along with the message:\n Please turn this into an excel file with columns "Date", "Amount", "Gain", "Loss". Thank you!',
      'Thanks!'
    );
  }



  //START File Upload Panel 
  onFileSelected(event: any): void {
    this.csvData = [];

    this.newExpenseSets = [];
    this.recognizedExpenseSets = [];
    this.duplicateExpenseNames = [];
    this.entriesToSave = [];

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

    const dialogRef = this.dialog.open(TextInputDialogComponent, {
      data: {
        title: "Create New Account",
        label: "Account Name"
      }
    });

    dialogRef.afterClosed().subscribe( newAccount => {
      this.dbAccounts.push(newAccount);
    });
  }

  /**
   * Create Table
   * START Process File Flow
   */

  readCsv(): void {
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
          this.identifyColumnsDialog();
          this.makeNewEntries();
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

  identifyColumnsDialog(): void {
    this.dialog.open(IdentifyColumnsDialogComponent, {
      data: this.csvData
    });
  }
  
  makeNewEntries(): void{
    //sets newEntries from csvData
    //makes transactionSets when name not found in db

    //sets newExpenseSets, recognizedExpenseSets, duplicateExpenseNames

    
    //removes empty entry at the end
    this.csvData.splice(this.csvData.length - 1, 1);

    //remove headers from Rogers files
    if(this.isRogersFile){
      this.csvData.splice(0, 1);
    }

    for(let i = this.csvData.length - 1; i > -1; i--){

      var newExpense: Expense = emptyExpense();
      var newExpenseName: ExpenseName = emptyExpenseName();

      var balanceChange: number = 0;
      var newName: string = '';
      var formattedDate: string = '';

      if(this.isCibcFile){

        formattedDate = this.csvData[i][0];        
        newName = this.csvData[i][1];

        const splitNameList = newName.split(" ").slice(0, -2);
        if(splitNameList.length > 0){
          newName = splitNameList.join(" ");
        }

        if(this.csvData[i][2]){
          balanceChange = parseFloat(this.csvData[i][2]) * -1;
        }
        else{
          balanceChange = parseFloat(this.csvData[i][3]);
        }
      }
      else if(this.isTdDebitFile){
        newName = this.csvData[i][1];
        var dateParts = this.csvData[i][0].split("/")
        formattedDate = dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1];
        if(this.csvData[i][2]){
          balanceChange = parseFloat(this.csvData[i][2]) * -1;
        }
        else{
          balanceChange = parseFloat(this.csvData[i][3]);
        }
      }
      else if(this.isRogersFile){
        //rogers files handle negative values as gains
        balanceChange = -1 * parseFloat(this.csvData[i][12].replace("$", '').replace(",",""));
        formattedDate = this.csvData[i][0];
        newName = this.csvData[i][7];
      }

      
      
      //ExpenseSet code

      newExpense.amount = balanceChange;
      newExpense.date = formattedDate;

      newExpenseName.name = newName;
      newExpenseName.expenseList = [newExpense]

      var newFirstWord = newName.split(" ")[0];

      //this could be optimized to check only date amount and name by hand before making entry
      
      //if the entry is in database, put into recognized or duplicate new entries
      //otherwise create a selectedSetToSplitNames
      if(this.uniqueDbNames.includes(newName)){
        var match = this.dbEntries.filter( val => {
          return val.name == newName &&
                  val.date == formattedDate &&
                  val.amount == balanceChange;
        });
        
        if(match.length != 0){
          this.duplicateExpenseNames.push(newExpenseName);
        }
        else{
          //expenseSet code

          var dbTransaction = this.dbEntries.find(t => t.name === newName);

          if(dbTransaction != undefined){
            var foundCategory = dbTransaction.category;

            var matchExpenseSet = this.recognizedExpenseSets.find( val => val.firstWord === newFirstWord);
    
            if(matchExpenseSet == undefined){
              var newExpenseSet: ExpenseSet = expenseSetFromExpenseName(newExpenseName);
              newExpenseSet.category = foundCategory;
              this.recognizedExpenseSets.push(newExpenseSet);
            }
            else{
              insertExpenseNameIntoExpenseSet(newExpenseName, matchExpenseSet);              
            }
          }
          else{
            console.error("Problem finding recognized transaction name for " + newName);
          }
        }
      }
      else{
        var matchExpenseSet = this.newExpenseSets.find( val => val.firstWord === newFirstWord);
  
        if(matchExpenseSet == undefined){
          var newExpenseSet: ExpenseSet = expenseSetFromExpenseName(newExpenseName);
          this.newExpenseSets.push(newExpenseSet);
        }
        else{
          insertExpenseNameIntoExpenseSet(newExpenseName, matchExpenseSet);
        }
      }
    }

    if(this.duplicateExpenseNames.length !=0){
      this.dialog.open(SubmittedTransactionsComponent, {
        data: this.duplicateExpenseNames
      });
    }

  }

  /* Table view */

  //this should be changed to be a dialog which looks like a modal and feeds
  //selectedSetToSplitNames as a parameter instead of having it global
  splitTransactionSetModal(setToSplit: ExpenseSet): void {
    this.selectedSetToSplit = setToSplit;
    this.selectedSetToSplitNames = setToSplit.expenseNameList.map( val => val.name);

    if(this.selectedSetToSplit.firstWord != ''){
      const splitTransactionSetModalElement = <HTMLElement> document.getElementById("splitTransactionSetModal");
      const splitTransactionSetModal = new Modal(splitTransactionSetModalElement);
      splitTransactionSetModal.show();
    }    
  }

  splitTransaction(): void {
    var splitSetIndex: number = this.newExpenseSets.indexOf(this.selectedSetToSplit);

    if(splitSetIndex > -1){

      var splitExpenseSetList: ExpenseSet[] = [];
  
      for(let splitExpenseName of this.selectedSetToSplit.expenseNameList){
        const tempExpenseSet: ExpenseSet = expenseSetFromExpenseName(splitExpenseName);
        splitExpenseSetList.push(tempExpenseSet);
      }
      this.newExpenseSets.splice( splitSetIndex, 1, ...splitExpenseSetList)
    }

    this.selectedSetToSplitNames = [];
    this.selectedSetToSplit = emptyExpenseSet();
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
      this.entriesToSave = [];

      var selectedAccountElement = this.fileForm.get('accountSelect');
      if(selectedAccountElement){
        var selectedAccount = selectedAccountElement.value;

        for(let newSet of this.newExpenseSets){
          this.entriesToSave.push(...expenseSetToTransactionList(newSet, selectedAccount));
        }
        for(let newSet of this.recognizedExpenseSets){
          this.entriesToSave.push(...expenseSetToTransactionList(newSet, selectedAccount));
        }
      }

      this.entriesToSave.sort((a,b) => {
        return a.date < b.date? -1: 1;
      })
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
    for(let newSet of this.newExpenseSets){
      const dropdownElement = (<HTMLInputElement>document.getElementById("dropdown" + newSet.firstWord));
      if(dropdownElement){
        newSet.category = dropdownElement.value;
        // for(let entry of this.newEntries){
        //   if(entry.name.indexOf(this.transactionSets[key]) === 0){
        //     entry.category = dropdownElement.value;
        //   }
        // }
      }
    }

    //check for entries with empty category
    for(let newSet of this.newExpenseSets){
      if(newSet.category == ''){ return false;}
    }
    return true;
  }

  //Could double check received transactions match uploaded ones.
  //Should send bulk and handle for loop in backend
  saveEntries(): void {
    for(let transaction of this.entriesToSave){
      this.transactionService.createTransaction(transaction).subscribe();
    }
  }
  //END Submit Statement Flow


}
