package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.models.Transaction;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query(value = "SELECT category FROM debit GROUP BY category UNION SELECT category FROM credit GROUP BY category", nativeQuery = true)
    List<String> getCategories();
}
