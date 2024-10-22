package com.example.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.models.Debit;
import com.example.demo.repositories.DebitRepository;

@Service
public class DebitService {

    private final DebitRepository debitRepository;

    @Autowired
    public DebitService(DebitRepository debitRepository) {
        this.debitRepository = debitRepository;
    }

    public List<Debit> getAllDebits() {
        return debitRepository.findAll();
    }

    public Debit saveDebit(Debit debit) {
        return debitRepository.save(debit);
    }

    public List<String> getCategories() {
        return debitRepository.getCategories();
    }
}
