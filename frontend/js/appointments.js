const API_BASE_URL = 'http://localhost:8081/api';

document.getElementById('fetch-btn').addEventListener('click', fetchAppointments);

async function fetchAppointments() {
    const patientId = document.getElementById('patientId').value;
    const listContainer = document.getElementById('appointments-list');

    if (!patientId) {
        alert('Please enter a Patient ID');
        return;
    }

    listContainer.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/appointments/patient/${patientId}`);
        if (!response.ok) throw new Error('Failed to fetch appointments');

        const appointments = await response.json();
        renderAppointments(appointments);
    } catch (error) {
        console.error(error);
        listContainer.innerHTML = '<p class="error-msg">Error fetching appointments. Check ID.</p>';
    }
}

function renderAppointments(appointments) {
    const listContainer = document.getElementById('appointments-list');

    if (appointments.length === 0) {
        listContainer.innerHTML = '<p>No appointments found for this ID.</p>';
        return;
    }

    listContainer.innerHTML = appointments.map(appt => `
        <div class="doctor-card" style="margin-bottom: 1rem;">
            <h3>${appt.doctor.name} - ${appt.doctor.specialization}</h3>
            <p><strong>Date:</strong> ${appt.appointmentDate}</p>
            <p><strong>Time:</strong> ${appt.startTime} - ${appt.endTime}</p>
            <p><strong>Status:</strong> <span style="color: ${appt.status === 'BOOKED' ? 'green' : 'red'}">${appt.status}</span></p>
        </div>
    `).join('');
}
