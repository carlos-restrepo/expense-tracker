import { Component, inject, ViewEncapsulation } from '@angular/core';
import { DebitService } from '../../services/debit.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import {} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonYearPipe } from '../../pipes/mon-year.pipe';
import { NewCategoryComponent } from '../../dialog/new-category/new-category.component';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCategoryConfirmComponent } from './dialog/update-category-confirm/update-category-confirm.component';
import { _countGroupLabelsBeforeOption } from '@angular/material/core';
import { filter } from 'rxjs';
declare const CanvasJS: any;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    
// TODO: `HttpClientModule` should not be imported into a component directly.
// Please refactor the code to add `provideHttpClient()` call to the provider list in the
// application bootstrap logic and remove the `HttpClientModule` import from this component.
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
  blacklistDefault: string[] = ["Internal", "Transfers"];
  blacklistCategories: string[] = [];
  filterCategories: string[] = [];

  blacklistMonthDefault: string[] = ["Internal", "Transfers","Mortgage"];
  blacklistMonthCategories: string[] = [];
  filterMonthCategories: string[] = [];

  
  dbAccounts: string[] = [];
  selectedAccounts: string[] = [];
  
  uniqueYyyymm: string[] = [];
  selectedYyyymm: string[] = [];

  monthTotals: number[] = [];

  displayAnalytics: boolean = false;
  selectedMonth: string = "";

  monthChart: any;
  overtimeChart: any;

  selectedMonthDb: Transaction[] = [];
  selectedMonthTotal: number = 0;
  previousMonthTotal: number = 0;
  monthTable: any[] = [];
  momKpi: number = 0;
  periodChangeTotal: number = 0;
  averageMonthlyTotal: number = 0;


  // Initializers
  
  constructor(
    private transactionService: TransactionService,
    private monYearPipe: MonYearPipe,
    private dialog: MatDialog,
  ) { }

  ngOnInit(){
    this.initCategories();
    this.initAccounts();
    this.initTransactions();
  }

  initTransactions(): void {
    this.transactionService.getAllTransactions().subscribe(
      (trans: Transaction[]) => {
        this.dbTransactions = trans;
        this.initUniqueYyyymm();
        this.updateFilteredDbTransactions();
        this.updateMonth();
        this.updateOvertimeChart();
      }
    );
  }

  initAccounts(): void {
    this.transactionService.getAccounts().subscribe(
      (accounts) => {
        this.dbAccounts = accounts;
        this.selectedAccounts = this.selectedAccounts.concat(accounts);
        this.dbAccounts.sort();
      }
    )
  }

  initCategories(): void {
    this.transactionService.getCategories().subscribe(
      (categories) => {
        this.dbCategories = this.dbCategories.concat(categories);
        this.blacklistCategories = this.blacklistCategories.concat(categories);
        this.blacklistMonthCategories = this.blacklistMonthCategories.concat(categories);

        this.initBlacklistDefault();
        this.initBlacklistMonthDefault();
        
        this.filterCategories = this.filterCategories.concat(categories);
        this.filterMonthCategories = this.filterMonthCategories.concat(categories);
        this.dbCategories.sort();
      }
    );
  }

  initBlacklistDefault(): void {
    for(let category of this.blacklistDefault){
      this.blacklistCategories.splice(
        this.blacklistCategories.indexOf(category),1
      );
      setTimeout(() => {
        const categoryCheckbox = document.getElementById(category + 'Blacklist') as HTMLInputElement;
        if(categoryCheckbox){
          categoryCheckbox.checked = true;
        }
    }, 300);
    }
  }

  initBlacklistMonthDefault(): void {
    for(let category of this.blacklistMonthDefault){
      this.blacklistMonthCategories.splice(
        this.blacklistMonthCategories.indexOf(category),1
      );
      setTimeout(() => {
        const categoryCheckbox = document.getElementById(category + 'MonthBlacklist') as HTMLInputElement;
        if(categoryCheckbox){
          categoryCheckbox.checked = true;
        }
    }, 300);
    }
  }

  initUniqueYyyymm(): void {
    this.uniqueYyyymm = this.dbTransactions.map(v => v.yyyymm).filter((val, i, arr) => {
      return arr.indexOf(val) === i;
    });

    this.uniqueYyyymm.sort()
    this.selectedYyyymm = this.uniqueYyyymm.slice(-12);

    this.selectedMonth = this.selectedYyyymm[this.selectedYyyymm.length - 1];
  }

  // Data Filters
  
  updateAccountPeriodData(): void {

  }
  
  updateFilteredDbTransactions(): void {
    this.filteredDbTransactions = this.dbTransactions.filter( (val) => {
      return this.blacklistCategories.includes(val.category)
          && this.filterCategories.includes(val.category)
          && this.selectedAccounts.includes(val.account)
          && this.selectedYyyymm.includes(val.yyyymm);
    });
    this.getMonthTotals();
  }

  getMonthTotals(): void {
    this.monthTotals = [];

    for(let month of this.selectedYyyymm){
      var monthAmounts: number[] = this.filteredDbTransactions.filter( (val, i, arr) => {
        return val.yyyymm === month;
      }).map(e => e.amount)

      var monthTotal: number = +monthAmounts.reduce( (acc, curr) => {
        return acc + curr;
      }, 0).toFixed(0);

      this.monthTotals.push(monthTotal);
    }
  }

  updateMonth(){
    this.updateSelectedMonthDb();
    this.changeMonthCategoryChart();
    this.changeMonthTable();
  }

  updateSelectedMonthDb(): void {
    this.selectedMonthDb  = this.filteredDbTransactions.filter( (val, i, obj) => {
      return val.yyyymm == this.selectedMonth
      && this.blacklistMonthCategories.includes(val.category);
    });

    this.updateMonthCards();
  }

  // Visuals

  updateOvertimeChart(): void {
    this.overtimeChart = new CanvasJS.Chart("overtimeChart", {
      theme: "light2",
      axisY: {
        interlacedColor: "#fff9f9", 
        valueFormatString:  "#,##0.##", // move comma to change formatting
        prefix: "$"
      },
      animationEnabled: true,
      data: []
    });

    var monthlyTotals = [];
    var zeroLine = [];

    for(let month of this.selectedYyyymm){
      var monthTotal = this.monthTotals.at(
        this.selectedYyyymm.indexOf(month)
      );

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
      });

      zeroLine.push({
        label: this.monYearPipe.transform(month),
        y: 0,
        markerSize: 0,
      })
    }

    this.overtimeChart.options.data.push({
      type: "line",
      indexLabel: "{y}",
      dataPoints: monthlyTotals,
    }) ;

    this.overtimeChart.options.data.push({
      type: "line",
      color: '#9c7500',
      dataPoints: zeroLine,
    }) ;

    this.overtimeChart.render();
  }

  changeMonthCategoryChart(): void{
    this.monthChart = new CanvasJS.Chart("monthChart", {
      theme: "light2",
      title: {
      },
      axisY: {
        interval: 50,
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
        indexLabelBorderColor: "#333333",
        indexLabelBorderThickness: 0.5,
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

    monthDataPoints = monthDataPoints.filter(v => v.y > 0);
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
    this.monthTable = this.monthTable.filter( val => {
      return this.filterMonthCategories.includes(val.category);
    });
  }

  updateMonthCards(): void {
    var index = this.selectedYyyymm.indexOf(this.selectedMonth)
    var val = this.monthTotals.at(index)
    if(val != undefined){
      this.selectedMonthTotal = val;
    }
    
    var PrevVal = this.monthTotals.at(index - 1)
    if(PrevVal != undefined){
      this.previousMonthTotal = PrevVal;
    }
    
    this.momKpi = (this.selectedMonthTotal - this.previousMonthTotal) / this.previousMonthTotal;
    this.periodChangeTotal = this.monthTotals.reduce( (acc, curr) => {
      return curr + acc;
    }, 0);
    this.averageMonthlyTotal = this.periodChangeTotal / this.selectedYyyymm.length;
  }

  // Visuals - changeMonthTable Helpers

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
        total += entry.amount;
      }
    }
    return +total.toFixed(2);
  }

  getNameMonthCategory(name: string): any{
    return this.selectedMonthDb.at(
      this.selectedMonthDb.map(v => v.name).indexOf(name)
    )?.category;
  }

  //Button Functions

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

  toggleCategoryFilter(category: string){

    var checksCount = 0;

    for(let cat of this.filterCategories){
      const categoryCheckbox = document.getElementById(cat + 'Filter') as HTMLInputElement;
      if(categoryCheckbox.checked){checksCount++;}
    }

    const categoryCheckbox = document.getElementById(category + 'Filter') as HTMLInputElement;
    categoryCheckbox.disabled = true;
    categoryCheckbox.checked = !categoryCheckbox.checked;
    setTimeout(() => {
      categoryCheckbox.disabled = false;
    }, 300);

    if(checksCount === 0){
      this.filterCategories = [category];
    }
    else{
      if(categoryCheckbox.checked){ this.filterCategories.push(category) }
      else{
        if(checksCount === 1){
          this.filterCategories = this.filterCategories.concat(this.dbCategories) 
        }
        else{
          this.filterCategories.splice(
            this.filterCategories.indexOf(category)
          )
        }
      }
    }

    this.updateFilteredDbTransactions();
    this.updateMonth();
    this.updateOvertimeChart();
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
      transaction.category = newCategory;

      if(transaction){
        this.transactionService.updateTransactionNameCategory(transaction).subscribe();
      }
    }

    this.updateFilteredDbTransactions();

  }

  toggleMonthCategoryFilter(category: string): void {

    var checksCount = 0;

    for(let cat of this.filterMonthCategories){
      const categoryCheckbox = document.getElementById(cat + 'MonthFilter') as HTMLInputElement;
      if(categoryCheckbox.checked){checksCount++;}
    }

    const categoryCheckbox = document.getElementById(category + 'MonthFilter') as HTMLInputElement;
    categoryCheckbox.disabled = true;
    categoryCheckbox.checked = !categoryCheckbox.checked;
    setTimeout(() => {
      categoryCheckbox.disabled = false;
    }, 300);

    if(checksCount === 0){
      this.filterMonthCategories = [category];
    }
    else{
      if(categoryCheckbox.checked){ this.filterMonthCategories.push(category) }
      else{ this.filterMonthCategories = this.filterMonthCategories.concat(this.dbCategories) }
    }

    this.updateFilteredDbTransactions();
    this.updateMonth();
  }

  toggleMonthBlacklistFilter(category: string): void {
    const categoryCheckbox = document.getElementById(category + 'MonthBlacklist') as HTMLInputElement;
    categoryCheckbox.disabled = true;
    categoryCheckbox.checked = !categoryCheckbox.checked;
    setTimeout(() => {
      categoryCheckbox.disabled = false;
    }, 300);

    if(categoryCheckbox.checked) {
      const categoryIndex = this.blacklistMonthCategories.indexOf(category);
      if(categoryIndex > -1){
        this.blacklistMonthCategories.splice(categoryIndex, 1);
      }
    } 
    else{
      this.blacklistMonthCategories.push(category);
    }

    this.updateFilteredDbTransactions();
    this.updateMonth();
  }
}
