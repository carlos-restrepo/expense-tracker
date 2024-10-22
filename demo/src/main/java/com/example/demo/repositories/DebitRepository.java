package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.models.Debit;

import java.util.List;

public interface DebitRepository extends JpaRepository<Debit, Long> {

    @Query(value = "SELECT category FROM categories", nativeQuery = true)
    List<String> getCategories();
}
