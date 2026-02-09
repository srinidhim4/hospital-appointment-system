package com.example.hospital.service;

import com.example.hospital.entity.Appointment;
import com.example.hospital.entity.Doctor;
import com.example.hospital.entity.Patient;
import com.example.hospital.exception.BookingConflictException;
import com.example.hospital.exception.ResourceNotFoundException;
import com.example.hospital.repository.AppointmentRepository;
import com.example.hospital.repository.DoctorRepository;
import com.example.hospital.repository.PatientRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Transactional
    public Appointment bookAppointment(Appointment appointment) {
        // Validate Doctor
        Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Validate Patient (create if not exists or fetch)
        Patient patient = appointment.getPatient();
        if (patient.getId() != null) {
            patient = patientRepository.findById(patient.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        } else if (patient.getEmail() != null) {
            Patient finalPatient = patient;
            patient = patientRepository.findByEmail(patient.getEmail())
                    .orElseGet(() -> patientRepository.save(finalPatient));
        } else {
            patient = patientRepository.save(patient);
        }
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setStatus(Appointment.AppointmentStatus.BOOKED);

        // Check for conflicts
        List<Appointment> conflictingAppointments = appointmentRepository.findConflictingAppointments(
                doctor.getId(),
                appointment.getAppointmentDate(),
                appointment.getStartTime(),
                appointment.getEndTime());

        if (!conflictingAppointments.isEmpty()) {
            throw new BookingConflictException("Doctor is already booked for the selected time slot.");
        }

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByDoctorAndDate(Long doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    public Appointment updateAppointmentStatus(Long id, String status) {
        logger.info("Attempting to update appointment {} to status {}", id, status);

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        try {
            appointment.setStatus(Appointment.AppointmentStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid status provided: {}", status, e);
            throw new RuntimeException("Invalid status: " + status);
        } catch (Exception e) {
            logger.error("Error updating appointment status", e);
            throw new RuntimeException("Error updating status: " + e.getMessage());
        }

        return appointmentRepository.save(appointment);
    }
}
