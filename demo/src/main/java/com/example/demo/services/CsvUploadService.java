package com.example.demo.services;

import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.models.Transaction;
import com.example.demo.repositories.TransactionRepository;

@Service
public class CsvUploadService {

    @Autowired
    private TransactionRepository transactionRepository;

    public void readAndUploadFile(MultipartFile csv) {

        try (
                Reader reader = new InputStreamReader(csv.getInputStream());
                CSVReader csvReader = new CSVReaderBuilder(reader).build()) {
            List<String[]> rows = csvReader.readAll();

            for (String[] row : rows) {
                Transaction trans = new Transaction(
                        row[0],
                        row[1],
                        Float.parseFloat(row[2]),
                        row[0].substring(0, 7),
                        row[3],
                        row[4]);
                transactionRepository.save(trans);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } catch (CsvException e) {
            e.printStackTrace();
        }
    }

}
