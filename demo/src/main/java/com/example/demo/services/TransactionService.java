package com.example.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.models.Transaction;
import com.example.demo.repositories.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<String> getCategories() {
        return transactionRepository.getCategories();
    }

    public List<String> getAccounts() {
        return transactionRepository.getAccounts();
    }

    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Transaction transaction) {
        Transaction foundTransaction = transactionRepository.findById(transaction.getId()).orElseThrow(
                () -> new RuntimeException("Debit not found with id " + transaction.getId()));

        foundTransaction.setAccount(transaction.getAccount());
        foundTransaction.setAmount(transaction.getAmount());
        foundTransaction.setCategory(transaction.getCategory());
        foundTransaction.setDate(transaction.getDate());
        foundTransaction.setName(transaction.getName());
        foundTransaction.setYyyymm(transaction.getYyyymm());

        return transactionRepository.save(foundTransaction);
    }
}
