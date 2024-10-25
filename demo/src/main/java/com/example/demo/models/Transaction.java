package com.example.demo.models;

import com.example.demo.constants.TableConstant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = TableConstant.NAME)
public class Transaction {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        private String date = "";
        private String name = "";
        private float amount = 0;
        private String yyyymm = "";
        private String category = "";
        private String account = "";

        public Transaction() {
        }

        public Transaction(String date, String name, float amount, String yyyymm, String category,
                        String account) {
                this.date = date;
                this.name = name;
                this.amount = amount;
                this.yyyymm = yyyymm;
                this.category = category;
                this.account = account;
        }

        public Long getId() {
                return id;
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
