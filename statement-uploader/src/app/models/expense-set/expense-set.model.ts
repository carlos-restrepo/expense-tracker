import { TranslationWidth } from "@angular/common"
import { Transaction } from "../transaction.model"

export interface Expense{
  amount: number,
  date: string
}
export interface ExpenseName {
  name: string,
  //temporary ? to wait to implement this later
  expenseList: Expense[]
}

export interface ExpenseSet{
  firstWord: string,
  commonSubstring: string,
  expenseNameList: ExpenseName[]
  totalAmount: number,
  category: string
}

export function emptyExpense(): Expense {
  const emptyExpense: Expense = {
    amount: 0,
    date: ''
  }
  return emptyExpense;
}

export function emptyExpenseName(): ExpenseName{
  const emptyExpenseName: ExpenseName = {
    name: '',
    expenseList: []
  }
  return emptyExpenseName;
}

export function emptyExpenseSet(): ExpenseSet{
  const emptyExpenseSet: ExpenseSet = {
    firstWord: '',
    commonSubstring: '',
    expenseNameList: [],
    totalAmount: 0,
    category: ''
  }

  return emptyExpenseSet
}

export function expenseSetFromExpenseName(expenseName: ExpenseName): ExpenseSet {
  const expenseListTotalAmount = expenseName.expenseList.map( val => val.amount).reduce( (acc, curr) => {
    return acc + curr;
  }, 0);
  const newExpenseSet: ExpenseSet = {
    firstWord: expenseName.name.split(" ")[0],
    commonSubstring: expenseName.name,
    totalAmount: expenseListTotalAmount,
    category: '',
    expenseNameList: [expenseName]
  }
  return newExpenseSet;
}

export function insertExpenseNameIntoExpenseSet(expenseName: ExpenseName, expenseSet: ExpenseSet): void {
  //updates expenseSet in place including the expenseName
  const expenseListTotalAmount = expenseName.expenseList.map( val => val.amount).reduce( (acc, curr) => {
    return acc + curr;
  }, 0);
  expenseSet.totalAmount += expenseListTotalAmount;


  var matchExpenseName = expenseSet.expenseNameList.find(val => val.name === expenseName.name);
  if(matchExpenseName == undefined){
    expenseSet.commonSubstring = findCommonSubstring(expenseSet.commonSubstring, expenseName.name);
    expenseSet.expenseNameList.push(expenseName);
  }
  else{
    matchExpenseName.expenseList = matchExpenseName.expenseList.concat(expenseName.expenseList);

    expenseSet.commonSubstring = findCommonSubstring(expenseSet.commonSubstring, matchExpenseName.name);
  }
}

export function findCommonSubstring(str1: string, str2: string): string {
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

export function expenseSetToTransactionList(expenseSet: ExpenseSet, account: string): Transaction[] {
  var transactionList: Transaction[] = [];

  for(let expenseName of expenseSet.expenseNameList){
    for(let expense of expenseName.expenseList){
      const newTransaction: Transaction = {
        name: expenseName.name,
        date: expense.date,
        amount: expense.amount,
        yyyymm: expense.date.substring(0,7),
        category: expenseSet.category,
        account: account
      }
      transactionList.push(newTransaction);
    }
  }
  return transactionList;
}