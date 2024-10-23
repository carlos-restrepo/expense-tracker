import { Component } from '@angular/core';
import { DebitService } from '../../services/debit.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { MonYearPipe } from '../../pipes/mon-year.pipe';
declare const CanvasJS: any;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    MonYearPipe
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent {

  dbTransactions: Transaction[] = [];

  isDebitSelected: boolean = true;
  isCreditSelected: boolean = true;

  dbCategories: string[] = [];
  selectedCategories: string[] = [];
  
  dbAccounts: string[] = [];
  selectedAccounts: string[] = [];
  
  uniqueYyyymm: string[] = [];

  displayAnalytics: boolean = false;
  selectedMonth: string = "";

  chartOptions: any;
  monthlyChart: any;
  selectedMonthDb: Transaction[] = [];
  monthTotal: number = 0;
  previousMonthTotal: number = 0;

  monthTable: any[] = [];

  //category blacklist is applied to db
  
  constructor(
    private transactionService: TransactionService,
    private debitService: DebitService,
  ) { }

  log(){
    console.log('categories')
    console.log(this.dbCategories);
    console.log('select categories')
    console.log(this.selectedCategories);
  }

  toggleCategoryBlacklist(category: string){
    const categoryCheckbox = document.getElementById(category + 'Blacklist') as HTMLInputElement;
    categoryCheckbox.disabled = true;
    categoryCheckbox.checked = !categoryCheckbox.checked;

    setTimeout(() => {
      categoryCheckbox.disabled = false;
  }, 300);

    if(categoryCheckbox.checked) { //If category just blacklisted, remove from selectedCategories
      const categoryIndex = this.selectedCategories.indexOf(category);
      if(categoryIndex > -1){
        this.selectedCategories.splice(categoryIndex, 1);
      }
    } 
    else{
      this.selectedCategories.push(category);
    }
    
    this.updateMonth();
  }

  toggleAccounts(account: string): void {
    const accountCheckbox = document.getElementById(account) as HTMLInputElement;
    accountCheckbox.disabled = true;
    accountCheckbox.checked = !accountCheckbox.checked;

    setTimeout(() => {
      accountCheckbox.disabled = false;
    }, 300);

    if(!accountCheckbox.checked) { //If category just blacklisted, remove from selectedCategories
      const accountIndex = this.selectedAccounts.indexOf(account);
      if(accountIndex > -1){
        this.selectedAccounts.splice(accountIndex, 1);
      }
    } 
    else{
      this.selectedAccounts.push(account);
    }

    this.updateMonth();
  }



  toggleCreditMonthDb(): void {
    if(!this.isCreditSelected){
      this.isCreditSelected = !this.isCreditSelected      
      this.dbTransactions = this.dbTransactions.concat(this.dbTransactions);
    }

    this.updateMonth();
  }

  ngOnInit(){

    this.transactionService.getCategories().subscribe(
      (categories) => {
        this.dbCategories = this.dbCategories.concat(categories);
        this.selectedCategories = this.selectedCategories.concat(categories);
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
        this.updateMonth();
      }
    );

  }

  getUniqueYyyymm(): void{
    this.uniqueYyyymm = this.dbTransactions.map(v => v.yyyymm).filter((val, i, arr) => {
      return arr.indexOf(val) === i;
    });

    this.uniqueYyyymm.sort();
    this.uniqueYyyymm.reverse();

    this.selectedMonth = this.uniqueYyyymm[0];
  }

  updateMonth(){
    this.updateSelectedDb();
    this.changeMonthCategoryChart();
    this.changeMonthTable();
  }

  updateSelectedDb(): void {
    this.selectedMonthDb  = this.dbTransactions.filter( (val, i, obj) => {
      return val.yyyymm == this.selectedMonth 
      && this.selectedCategories.includes(val.category)
      && this.selectedAccounts.includes(val.account);
    });

    this.monthTotal = this.selectedMonthDb.map( v => v.amount).reduce(
      (total, current) => {
        return total += current * -1;
      }, 0
    );

    var previousMonth = this.uniqueYyyymm.at(
      this.uniqueYyyymm.indexOf(this.selectedMonth) + 1
    );
    
    var previousMonthDb = this.dbTransactions.filter( (val, i, obj) => {
      return val.yyyymm == previousMonth 
      && this.selectedCategories.includes(val.category)
      && this.selectedAccounts.includes(val.account);
    });

    this.previousMonthTotal = previousMonthDb.map( v => v.amount).reduce(
      (total, current) => {
        return total += current * -1;
      }, 0
    );
  }

  changeMonthCategoryChart(): void{
    this.monthlyChart = new CanvasJS.Chart("monthlyChart", {
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
    
     var monthlyDataPoints = [];

    for(let category of this.selectedCategories){
      monthlyDataPoints.push({
        label: category,
        y: 0,
      });
    }
    
    var monthTotal = 0;

    for(let entry of this.selectedMonthDb){
      var dataPt = monthlyDataPoints.find( ({ label }) => label === entry.category);

      if(dataPt != undefined){
        dataPt.y += entry.amount * -1;
      }
    }

    monthlyDataPoints.sort((a,b) => a.y - b.y); //sort and cut off top 5
    monthlyDataPoints = monthlyDataPoints.slice(-5);
    
    this.monthlyChart.options.data[0].dataPoints = monthlyDataPoints;
    this.monthlyChart.render();
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
