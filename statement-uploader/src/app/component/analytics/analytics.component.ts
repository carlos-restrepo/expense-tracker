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

  dbSelected: Transaction[] = [];

  dbDebit: Transaction[] = [];
  dbCredit: Transaction[] = [];

  isDebitSelected: boolean = true;
  isCreditSelected: boolean = true;

  uniqueCategories: string[] = [];
  selectedCategories: string[] = [];
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
    console.log(this.uniqueCategories);
    console.log('select categories')
    console.log(this.selectedCategories);
  }

  toggleCategoryBlacklist(category: string){
    const checkbox = document.getElementById(category + 'Blacklist') as HTMLInputElement;
    checkbox.disabled = true;
    checkbox.checked = !checkbox.checked;

    setTimeout(() => {
      checkbox.disabled = false;
  }, 300);

    if(checkbox.checked) { //If category just blacklisted, remove from selectedCategories
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

  toggleDebitMonthDb(): void {
    if(!this.isDebitSelected){
      this.isDebitSelected = !this.isDebitSelected      
      this.dbSelected = this.dbSelected.concat(this.dbDebit);
    }
    else if(this.isCreditSelected && this.isDebitSelected){
      this.isDebitSelected = !this.isDebitSelected      
      this.dbSelected = this.dbCredit;
    }

    this.updateMonth();
  }

  toggleCreditMonthDb(): void {
    if(!this.isCreditSelected){
      this.isCreditSelected = !this.isCreditSelected      
      this.dbSelected = this.dbSelected.concat(this.dbCredit);
    }
    else if(this.isCreditSelected && this.isDebitSelected){
      this.isCreditSelected = !this.isCreditSelected      
      this.dbSelected = this.dbDebit;
    }

    this.updateMonth();
  }

  ngOnInit(){

    this.transactionService.getCategories().subscribe(
      (categories) => {
        this.uniqueCategories = this.uniqueCategories.concat(categories);
        this.selectedCategories = this.selectedCategories.concat(categories);
        this.uniqueCategories.sort();
      }
    );
    
    this.transactionService.getAllTransactions().subscribe(
      (trans: Transaction[]) => {
        this.dbCredit = trans;
        this.dbSelected = this.dbSelected.concat(trans);
        this.getUniqueYyyymm();
        this.updateMonth();
      }
    );

    this.debitService.getAllDebits().subscribe(
      (debit: Transaction[]) => {
        this.dbDebit = debit;
        this.dbSelected = this.dbSelected.concat(debit);
        this.getUniqueYyyymm();
        this.updateMonth();
      }
    )

  }

  getUniqueYyyymm(): void{
    this.uniqueYyyymm = this.dbSelected.map(v => v.yyyymm).filter((val, i, arr) => {
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
    this.selectedMonthDb  = this.dbSelected.filter( (val, i, obj) => {
      return val.yyyymm == this.selectedMonth && this.selectedCategories.includes(val.category);
    });

    this.monthTotal = this.selectedMonthDb.map( v => v.amount).reduce(
      (total, current) => {
        return total += current * -1;
      }, 0
    );

    var previousMonth = this.uniqueYyyymm.at(
      this.uniqueYyyymm.indexOf(this.selectedMonth) + 1
    );
    
    var previousMonthDb = this.dbSelected.filter( (val, i, obj) => {
      return val.yyyymm == previousMonth && this.selectedCategories.includes(val.category);
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
        if(!this.uniqueCategories.includes(entry.category)){
          this.uniqueCategories.push(entry.category);
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
