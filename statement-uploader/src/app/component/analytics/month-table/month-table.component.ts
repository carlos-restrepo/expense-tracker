import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../models/transaction.model';
import { NewCategoryComponent } from '../../../dialog/new-category/new-category.component';
import { UpdateCategoryConfirmComponent } from '../dialog/update-category-confirm/update-category-confirm.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-month-table',
  standalone: true,
  imports: [
    CurrencyPipe,
    PercentPipe,
    CommonModule,
    FormsModule
  ],
  templateUrl: './month-table.component.html',
  styleUrl: './month-table.component.css'
})
export class MonthTableComponent {

  @Input() monthTable!: any[];
  @Input() dbCategories!: string[];

  filterMonthCategories: string[] = [];

  constructor(
    private dialog: MatDialog
  ){}

  ngOnInit(){

  }


  createCategoryButton(transaction: Transaction):void {
    alert('test')
    const dialogRef = this.dialog.open(NewCategoryComponent,{
      width: "400px",
      height: "300px",
    });

    dialogRef.afterClosed().subscribe(
      newCategory => {
        if(newCategory != undefined){
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

  //commented out
  changeTransactionCategory(name: string, newCategory: string): void {

    // var transactionNameList = this.dbTransactions.filter(val => val.name === name);

    // for(let transaction of transactionNameList){
    //   transaction.category = newCategory;

    //   if(transaction){
    //     this.transactionService.updateTransactionNameCategory(transaction).subscribe();
    //   }
    // }

    // this.updateMonth();
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

    // this.updateFilteredDbTransactions();
    // this.updateMonth();
  }

  toggleMonthBlacklistFilter(category: string): void {
    // const categoryCheckbox = document.getElementById(category + 'MonthBlacklist') as HTMLInputElement;
    // categoryCheckbox.disabled = true;
    // categoryCheckbox.checked = !categoryCheckbox.checked;
    // setTimeout(() => {
    //   categoryCheckbox.disabled = false;
    // }, 300);

    // if(categoryCheckbox.checked) {
    //   const categoryIndex = this.blacklistMonthCategories.indexOf(category);
    //   if(categoryIndex > -1){
    //     this.blacklistMonthCategories.splice(categoryIndex, 1);
    //   }
    // } 
    // else{
    //   this.blacklistMonthCategories.push(category);
    // }

    // this.updateFilteredDbTransactions();
    // this.updateMonth();
  }

  sortMonthTableByTransaction(): void {
    this.monthTable.sort();
  }

}
