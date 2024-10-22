package com.example.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.services.CsvUploadService;

@RestController
@RequestMapping("/api/trans/csv-upload")
@CrossOrigin(origins = "http://localhost:4200")
public class CsvUploadController {

    @Autowired
    CsvUploadService csvUploadService;

    @PostMapping
    public void receiveFile(@RequestParam("file") MultipartFile file) {
        csvUploadService.readAndUploadFile(file);
    }
}
