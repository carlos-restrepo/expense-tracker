import { Component, inject, ViewEncapsulation } from '@angular/core';
import { DebitService } from '../../services/debit.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonYearPipe } from '../../pipes/mon-year.pipe';
import { NewCategoryComponent } from '../../dialog/new-category/new-category.component';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCategoryConfirmComponent } from './dialog/update-category-confirm/update-category-confirm.component';
declare const CanvasJS: any;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    MonYearPipe,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent {

  dbTransactions: Transaction[] = [];
  filteredDbTransactions: Transaction[] = [];

  dbCategories: string[] = [];
  blacklistCategories: string[] = [];
  
  dbAccounts: string[] = [];
  selectedAccounts: string[] = [];
  
  uniqueYyyymm: string[] = [];

  displayAnalytics: boolean = false;
  selectedMonth: string = "";

  monthChart: any;
  overtimeChart: any;

  selectedMonthDb: Transaction[] = [];
  monthTotal: number = 0;
  previousMonthTotal: number = 0;
  monthTable: any[] = [];



  // Initializers
  
  constructor(
    private transactionService: TransactionService,
    private monYearPipe: MonYearPipe,
    private dialog: MatDialog,
  ) { }

  ngOnInit(){

    this.transactionService.getCategories().subscribe(
      (categories) => {
        this.dbCategories = this.dbCategories.concat(categories);
        this.blacklistCategories = this.blacklistCategories.concat(categories);
        this.blacklistCategories.splice(
          this.blacklistCategories.indexOf("Internal"),1
        );
        this.blacklistCategories.splice(
          this.blacklistCategories.indexOf("Transfers"),1
        );

        setTimeout(() => {
          const categoryCheckbox = document.getElementById("Internal" + 'Blacklist') as HTMLInputElement;
          categoryCheckbox.checked = true;
          const cat2 = document.getElementById("Transfers" + 'Blacklist') as HTMLInputElement;
          cat2.checked = true;
      }, 300);
        this.dbCategories.sort();
      }
    );

    this.transactionService.getAccounts().subscribe(
      (accounts) => {
        this.dbAccounts = accounts;
        this.selectedAccounts = this.selectedAccounts.concat(accounts);
        this.dbAccounts.sort();
      }
    )
    
    this.transactionService.getAllTransactions().subscribe(
      (trans: Transaction[]) => {
        this.dbTransactions = trans;
        this.getUniqueYyyymm();
        this.updateFilteredDbTransactions();
        this.updateMonth();
        this.updateOvertimeChart();
      }
    );

  }

  getUniqueYyyymm(): void {
    this.uniqueYyyymm = this.dbTransactions.map(v => v.yyyymm).filter((val, i, arr) => {
      return arr.indexOf(val) === i;
    });

    this.uniqueYyyymm.sort();
    this.uniqueYyyymm.reverse();

    this.selectedMonth = this.uniqueYyyymm[0];
  }

  updateOvertimeChart(): void {
    this.overtimeChart = new CanvasJS.Chart("overtimeChart", {
      theme: "light2",
      title: {
        text: "Total Change over Time"
      },
      axisY: {
        interlacedColor: "#fff9f9", 
        valueFormatString:  "#,##0.##", // move comma to change formatting
        prefix: "$"
      },
      animationEnabled: true,
      data: [{
        type: "line",
        indexLabel: "{y}",
        dataPoints: [],
      }]
    });

    var monthlyTotals = [];

    for(let month of this.uniqueYyyymm.sort()){
      var monthAmounts: number[] = this.filteredDbTransactions.filter( (val, i, arr) => {
        return val.yyyymm === month;
      }).map(e => e.amount)

      var monthTotal: number = +monthAmounts.reduce( (acc, curr) => {
        return acc + curr;
      }, 0).toFixed(0);

      monthlyTotals.push({
        label: this.monYearPipe.transform(month), 
        y: monthTotal,
        indexLabelFormatter: (e:any) => {
          return e.dataPoint.y < 0? "\u2800-$" + (-1*e.dataPoint.y) + "\u2800" : "\u2800$" + e.dataPoint.y + "\u2800"
        },
        indexLabelBorderColor: "#333333",
        indexLabelBorderThickness: 0.5,
        indexLabelFontSize: 15,
        indexLabelFontColor: "#000000",
        indexLabelBackgroundColor: "#f9e3a7"
      })
    }

    this.overtimeChart.options.data[0].dataPoints = monthlyTotals;
    this.overtimeChart.render();
  }

  //Button Functions

  log(){
    console.log('categories')
    console.log(this.dbCategories);
    console.log('select categories')
    console.log(this.blacklistCategories);
  }

  toggleCategoryBlacklist(category: string){
    const categoryCheckbox = document.getElementById(category + 'Blacklist') as HTMLInputElement;
    categoryCheckbox.disabled = true;
    categoryCheckbox.checked = !categoryCheckbox.checked;

    setTimeout(() => {
      categoryCheckbox.disabled = false;
  }, 300);

    if(categoryCheckbox.checked) { //If category just blacklisted, remove from blacklistCategories
      const categoryIndex = this.blacklistCategories.indexOf(category);
      if(categoryIndex > -1){
        this.blacklistCategories.splice(categoryIndex, 1);
      }
    } 
    else{
      this.blacklistCategories.push(category);
    }

    this.updateFilteredDbTransactions();
    this.updateMonth();
    this.updateOvertimeChart();
  }

  toggleAccounts(account: string): void {
    const accountCheckbox = document.getElementById(account) as HTMLInputElement;
    accountCheckbox.disabled = true;
    accountCheckbox.checked = !accountCheckbox.checked;

    setTimeout(() => {
      accountCheckbox.disabled = false;
    }, 300);

    if(!accountCheckbox.checked) {
      const accountIndex = this.selectedAccounts.indexOf(account);
      if(accountIndex > -1){
        this.selectedAccounts.splice(accountIndex, 1);
      }
    } 
    else{
      this.selectedAccounts.push(account);
    }

    this.updateFilteredDbTransactions();
    this.updateMonth();
    this.updateOvertimeChart();
  }

  updateFilteredDbTransactions(): void {
    this.filteredDbTransactions = this.dbTransactions.filter( (val) => {
      return this.blacklistCategories.includes(val.category)
          && this.selectedAccounts.includes(val.account);
    });
  }

  createCategoryButton(transaction: Transaction):void {
    const dialogRef = this.dialog.open(NewCategoryComponent,{
      width: "400px",
      height: "300px",
    });

    dialogRef.afterClosed().subscribe(
      newCategory => {
        if(newCategory != undefined){
          // this.dbCategories.push(newCategory);
          // this.dbCategories.sort();
          const confirmDialogRef = this.dialog.open(UpdateCategoryConfirmComponent,{
            data: {
              name: transaction.name,
              category: transaction.category,
              newCategory: newCategory
            }
          });

          confirmDialogRef.afterClosed().subscribe(result => {
            if(result){
              this.changeTransactionCategory(transaction.name, newCategory);
            }
          })
        }
        else{
          alert("Canceled by invalid category");
        }
      });
  }

  changeTransactionCategory(name: string, newCategory: string): void {

    var transactionNameList = this.dbTransactions.filter(val => val.name === name);

    for(let transaction of transactionNameList){
      console.log(transaction.name);
      console.log(transaction.date);

      transaction.category = newCategory;

      if(transaction){
        console.log(transaction.category);
        this.transactionService.updateTransactionNameCategory(transaction).subscribe();
      }
    }

    this.updateFilteredDbTransactions();

  }

  //Monthly Analytics

  updateMonth(){
    this.updateSelectedDb();
    this.changeMonthCategoryChart();
    this.changeMonthTable();
  }

  updateSelectedDb(): void {
    this.selectedMonthDb  = this.filteredDbTransactions.filter( (val, i, obj) => {
      return val.yyyymm == this.selectedMonth
    });

    this.monthTotal = this.selectedMonthDb.map( v => v.amount).reduce(
      (total, current) => {
        return total += current * -1;
      }, 0
    );

    var previousMonth = this.uniqueYyyymm.at(
      this.uniqueYyyymm.indexOf(this.selectedMonth) - 1
    );
    
    var previousMonthDb = this.filteredDbTransactions.filter( (val, i, obj) => {
      return val.yyyymm == previousMonth 
      && this.blacklistCategories.includes(val.category)
      && this.selectedAccounts.includes(val.account);
    });

    this.previousMonthTotal = previousMonthDb.map( v => v.amount).reduce(
      (total, current) => {
        return total += current * -1;
      }, 0
    );
  }

  changeMonthCategoryChart(): void{
    this.monthChart = new CanvasJS.Chart("monthChart", {
      theme: "light2",
      title: {
      },
      animationEnabled: true,
      data: [{
        type: "bar",
        indexLabel: "{y}",
        dataPoints: [],
      }]
    });
    
     var monthDataPoints = [];

    for(let category of this.blacklistCategories){
      monthDataPoints.push({
        label: category,
        y: 0,
        indexLabelFormatter: (e:any) => {
          return "\u2800$" + e.dataPoint.y + "\u2800"
        },
        indexLabelFontSize: 15,
        indexLabelFontColor: "#000000",
        indexLabelBackgroundColor: "#f9e3a7"
      });
    }
    
    var monthTotal = 0;

    for(let entry of this.selectedMonthDb){
      var dataPt = monthDataPoints.find( ({ label }) => label === entry.category);

      if(dataPt != undefined){
        dataPt.y += entry.amount * -1;
      }
    }

    for(let dataPt of monthDataPoints){
      dataPt.y = +dataPt.y.toFixed(0);
    }

    monthDataPoints.sort((a,b) => a.y - b.y); //sort and cut off top 5
    monthDataPoints = monthDataPoints.slice(-5);
    
    this.monthChart.options.data[0].dataPoints = monthDataPoints;
    this.monthChart.render();
  }

  changeMonthTable():void {

    var monthUniqueNames = this.findUniqueNames();

    this.monthTable = [];

    for(let name of monthUniqueNames){
      this.monthTable.push({
        name: name,
        amount: this.getNameMonthTotal(name),
        category: this.getNameMonthCategory(name)
      });
    }

    this.monthTable.sort((a,b) => a.amount - b.amount);
    this.monthTable.reverse();
  }

  filterMonthTableCategories(category: string): void {
    this.monthTable.filter(transaction => transaction.category === category);
  }

  // changeMonthTable Helpers

  findUniqueNames(): string[]{
    var uniqueNames: string[] = [];

    for(let entry of this.selectedMonthDb){
      if(entry.category){
        if(!this.dbCategories.includes(entry.category)){
          this.dbCategories.push(entry.category);
        }
      }
      if(!uniqueNames.includes(entry.name)){
        uniqueNames.push(entry.name);
      }
    }

    return uniqueNames;
  }

  getNameMonthTotal(name: string): number{
    var total: number = 0;

    for(let entry of this.selectedMonthDb){
      if(entry.name.indexOf(name) >= 0){
        total += entry.amount * -1;
      }
    }
    return +total.toFixed(2);
  }

  getNameMonthCategory(name: string): any{
    return this.selectedMonthDb.at(
      this.selectedMonthDb.map(v => v.name).indexOf(name)
    )?.category;
  }


}
