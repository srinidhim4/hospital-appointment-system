package com.example.hospital.controller;

import com.example.hospital.entity.Patient;
import com.example.hospital.exception.ResourceNotFoundException;
import com.example.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/register")
    public ResponseEntity<Patient> register(@RequestBody Patient patient) {
        if (patientRepository.findByEmail(patient.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        return ResponseEntity.ok(patientRepository.save(patient));
    }

    @PostMapping("/login")
    public ResponseEntity<Patient> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!patient.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }
        return ResponseEntity.ok(patient);
    }
}
