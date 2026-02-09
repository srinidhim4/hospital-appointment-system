package com.example.hospital.controller;

import com.example.hospital.entity.Appointment;
import com.example.hospital.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*") // Allow frontend access
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
        Appointment savedAppointment = appointmentService.bookAppointment(appointment);
        return ResponseEntity.ok(savedAppointment);
    }

    @GetMapping("/doctor/{doctorId}/date/{date}")
    public List<Appointment> getAppointmentsByDoctorAndDate(
            @PathVariable("doctorId") Long doctorId,
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentService.getAppointmentsByDoctorAndDate(doctorId, date);
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsByPatient(@PathVariable("patientId") Long patientId) {
        return appointmentService.getAppointmentsByPatient(patientId);
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable("id") Long id,
            @RequestBody java.util.Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status));
    }
}
