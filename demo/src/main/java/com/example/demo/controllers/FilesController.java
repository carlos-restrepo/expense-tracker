package com.example.demo.controllers;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// import org.hibernate.mapping.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class FilesController {

    private String uploadPath = "C:\\Users\\Carlos\\Documents\\VS Code\\WebApp\\uploaded-files";

    @PostMapping("/files")
    public void receiveFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            System.out.print("Empty file");
        } else {

            try {
                String fileName = file.getOriginalFilename();
                File destinationFile = new File(uploadPath + File.separator + fileName);
                file.transferTo(destinationFile);
            } catch (IOException e) {
                e.printStackTrace();
            }

            System.out.println("success");
        }
    }

}
