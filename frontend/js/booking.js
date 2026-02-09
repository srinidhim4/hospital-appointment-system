const API_BASE_URL = 'http://localhost:8081/api';
let currentDoctor = null;
let selectedSlot = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctorId');

    if (doctorId) {
        document.getElementById('doctorId').value = doctorId;
        fetchDoctorDetails(doctorId);
    } else {
        document.getElementById('doctor-info').textContent = 'No doctor selected. Please go back and select a doctor.';
    }

    // Set min date to today
    const dateInput = document.getElementById('appointmentDate');
    dateInput.min = new Date().toISOString().split('T')[0];
    dateInput.addEventListener('change', handleDateChange);

    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);
});

async function fetchDoctorDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/${id}`);
        if (!response.ok) throw new Error('Doctor not found');
        currentDoctor = await response.json();

        document.getElementById('doctor-info').textContent = `Booking with ${currentDoctor.name} (${currentDoctor.specialization})`;
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function handleDateChange(e) {
    const date = e.target.value;
    if (!date || !currentDoctor) return;

    const slotsContainer = document.getElementById('slots-container');
    slotsContainer.innerHTML = '<p>Loading slots...</p>';
    selectedSlot = null; // Reset selection
    document.getElementById('submit-btn').disabled = true;

    try {
        // Fetch existing appointments
        const response = await fetch(`${API_BASE_URL}/appointments/doctor/${currentDoctor.id}/date/${date}`);
        const appointments = await response.json();

        generateSlots(currentDoctor.workingStartTime, currentDoctor.workingEndTime, appointments, date);
    } catch (error) {
        console.error(error);
        slotsContainer.innerHTML = '<p class="error-msg">Failed to load slots.</p>';
    }
}

function generateSlots(start, end, appointments, date) {
    const slotsContainer = document.getElementById('slots-container');
    slotsContainer.innerHTML = '';

    const startTime = parseTime(start); // HH:mm:ss to minutes
    const endTime = parseTime(end);

    // Create 30 min slots
    for (let time = startTime; time < endTime; time += 30) {
        const slotStart = formatTimeFromMinutes(time);
        const slotEnd = formatTimeFromMinutes(time + 30);

        // Check if slot is in the past (if today)
        const now = new Date();
        const slotDate = new Date(date + 'T' + slotStart);
        if (slotDate < now) continue;

        // Check conflicts
        const isBooked = appointments.some(appt => {
            return isOverlapping(slotStart, slotEnd, appt.startTime, appt.endTime);
        });

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot-btn';
        btn.textContent = `${formatDisplayTime(slotStart)} - ${formatDisplayTime(slotEnd)}`;
        btn.disabled = isBooked;

        if (!isBooked) {
            btn.onclick = () => selectSlot(btn, slotStart, slotEnd);
        }

        slotsContainer.appendChild(btn);
    }

    if (slotsContainer.children.length === 0) {
        slotsContainer.innerHTML = '<p>No slots available for this date.</p>';
    }
}

function isOverlapping(newStart, newEnd, existingStart, existingEnd) {
    // String comparison works for HH:mm:ss in 24h format
    // (newStart < existingEnd) AND (newEnd > existingStart)
    return newStart < existingEnd && newEnd > existingStart;
}

function selectSlot(btn, start, end) {
    // Deselect previous
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSlot = { start, end };
    document.getElementById('submit-btn').disabled = false;
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    if (!selectedSlot || !currentDoctor) return;

    const patientName = document.getElementById('patientName').value;
    const patientEmail = document.getElementById('patientEmail').value;
    const patientPhone = document.getElementById('patientPhone').value;
    const patientId = document.getElementById('patientId').value; // Hidden field
    const date = document.getElementById('appointmentDate').value;

    const bookingData = {
        doctor: { id: currentDoctor.id },
        patient: {
            name: patientName,
            email: patientEmail,
            phone: patientPhone,
            // If patientId exists, include it to link to existing account
            ...(patientId && { id: patientId })
        },
        appointmentDate: date,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end
    };

    try {
        const response = await fetch(`${API_BASE_URL}/appointments/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            showMessage('Booking confirmed successfully!', 'success');
            document.getElementById('booking-form').reset();
            document.getElementById('slots-container').innerHTML = '';
            document.getElementById('submit-btn').disabled = true;
            selectedSlot = null;
        } else {
            const error = await response.json();
            showMessage(error.message || 'Booking failed', 'error');
            // Refresh slots to show the newly booked one if conflict
            handleDateChange({ target: { value: date } });
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function showMessage(msg, type) {
    const container = document.getElementById('message-container');
    container.innerHTML = `<div class="${type === 'error' ? 'error-msg' : 'success-msg'}">${msg}</div>`;
}

// Helpers
function parseTime(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function formatTimeFromMinutes(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
}

function formatDisplayTime(timeStr) {
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${m} ${ampm}`;
}
