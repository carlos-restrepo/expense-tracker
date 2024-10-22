package com.example.demo.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.Debit;
import com.example.demo.services.DebitService;

@RestController
@RequestMapping("/debits")
@CrossOrigin(origins = "http://localhost:4200")
public class DebitController {

    private final DebitService debitService;

    @Autowired
    public DebitController(DebitService debitService) {
        this.debitService = debitService;
    }

    @GetMapping
    public List<Debit> getAllDebits() {
        List<Debit> temp = debitService.getAllDebits();
        return temp;
    }

    @PostMapping
    public Debit saveDebit(@RequestBody Debit debit) {
        return debitService.saveDebit(debit);
    }
}
