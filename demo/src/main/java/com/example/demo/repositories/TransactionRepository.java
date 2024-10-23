package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.models.Transaction;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query(value = "SELECT DISTINCT(category) as category FROM finances.transactions", nativeQuery = true)
    List<String> getCategories();

    @Query(value = "SELECT DISTINCT(account) FROM finances.transactions", nativeQuery = true)
    List<String> getAccounts();
}
