package com.example.demo.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "debit")
public class Debit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String date = "";
    private String name = "";

    @JsonProperty("amount")
    private float amount;

    @JsonProperty("balance")
    private float balance;

    private String yyyymm = "";
    private String category = "";
    private String account = "";

    public Debit() {
    }

    public Debit(String date, String name, float amount, float balance, String yyyymm, String category,
            String account) {
        this.date = date;
        this.name = name;
        this.amount = amount;
        this.balance = balance;
        this.yyyymm = yyyymm;
        this.category = category;
        this.account = account;
    }

    public String getDate() {
        return date;
    }

    public String getName() {
        return name;
    }

    public float getAmount() {
        return amount;
    }

    public float getBalance() {
        return balance;
    }

    public String getYyyymm() {
        return yyyymm;
    }

    public String getCategory() {
        return category;
    }

    public String getAccount() {
        return account;
    }

    public void setDate(String newDate) {
        date = newDate;
    }

    public void setName(String newName) {
        name = newName;
    }

    public void setAmount(float newAmount) {
        amount = newAmount;
    }

    public void setBalance(float newBalance) {
        balance = newBalance;
    }

    public void setYyyymm(String newYyyymm) {
        yyyymm = newYyyymm;
    }

    public void setCategory(String newCategory) {
        category = newCategory;
    }

    public void setAccount(String newAccount) {
        account = newAccount;
    }
}
