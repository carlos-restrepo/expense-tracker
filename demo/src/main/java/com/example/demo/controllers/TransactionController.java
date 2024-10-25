package com.example.demo.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.Transaction;
import com.example.demo.services.TransactionService;

@RestController
@RequestMapping("/transactions")
@CrossOrigin(origins = "http://localhost:4200")
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        List<Transaction> temp = transactionService.getAllTransactions();
        return temp;
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return transactionService.getCategories();
    }

    @GetMapping("/accounts")
    public List<String> getAccounts() {
        return transactionService.getAccounts();
    }

    @PostMapping
    public Transaction saveTransaction(@RequestBody Transaction transaction) {
        return transactionService.saveTransaction(transaction);
    }

    @PutMapping
    public Transaction updateTransaction(@RequestBody Transaction transaction) {
        return transactionService.updateTransaction(transaction);
    }
}
