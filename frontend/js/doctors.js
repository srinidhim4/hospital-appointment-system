const API_BASE_URL = 'http://localhost:8081/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchDoctors();
});

async function fetchDoctors() {
    const doctorList = document.getElementById('doctor-list');

    try {
        const response = await fetch(`${API_BASE_URL}/doctors`);
        if (!response.ok) {
            throw new Error('Failed to fetch doctors');
        }

        const doctors = await response.json();
        renderDoctors(doctors);
    } catch (error) {
        doctorList.innerHTML = `<div class="error-msg">Error loading doctors: ${error.message}. Is the backend running?</div>`;
        console.error(error);
    }
}

function renderDoctors(doctors) {
    const doctorList = document.getElementById('doctor-list');

    if (doctors.length === 0) {
        doctorList.innerHTML = '<p>No doctors found.</p>';
        return;
    }

    doctorList.innerHTML = doctors.map(doctor => `
        <div class="doctor-card">
            <h3 class="doctor-name">${doctor.name}</h3>
            <p class="doctor-specialization">${doctor.specialization}</p>
            <div class="doctor-timings">
                ${formatTime(doctor.workingStartTime)} - ${formatTime(doctor.workingEndTime)}
            </div>
            <a href="book-appointment.html?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}" class="btn">
                Book Appointment
            </a>
        </div>
    `).join('');
}

function formatTime(timeString) {
    // timeString is HH:mm:ss
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
