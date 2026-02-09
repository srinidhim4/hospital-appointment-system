const API_BASE_URL = 'http://localhost:8081/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchDoctors();
    fetchAppointments();
});

async function fetchDoctors() {
    const list = document.getElementById('doctors-list');
    list.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/doctors`);
        const doctors = await response.json();

        if (doctors.length === 0) {
            list.innerHTML = '<tr><td colspan="4">No doctors found.</td></tr>';
            return;
        }

        list.innerHTML = doctors.map(doc => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 1rem;">${doc.id}</td>
                <td style="padding: 1rem;">${doc.name}</td>
                <td style="padding: 1rem;">${doc.specialization}</td>
                <td style="padding: 1rem;">
                    <button class="btn" style="background: #e74c3c; padding: 0.5rem 1rem; font-size: 0.9rem;" 
                            onclick="deleteDoctor(${doc.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        list.innerHTML = '<tr><td colspan="4" style="color:red;">Error loading doctors.</td></tr>';
    }
}

async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor? This cannot be undone.')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/doctors/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Doctor deleted successfully.');
            fetchDoctors();
        } else {
            alert('Failed to delete doctor. They might have active appointments.');
        }
    } catch (e) {
        alert('Network error.');
    }
}

async function fetchAppointments() {
    const list = document.getElementById('appointments-list');
    list.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/appointments`);
        const appointments = await response.json();

        if (appointments.length === 0) {
            list.innerHTML = '<tr><td colspan="6">No appointments found.</td></tr>';
            return;
        }

        list.innerHTML = appointments.map(appt => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 1rem;">${appt.id}</td>
                <td style="padding: 1rem;">${appt.doctor.name}<br><small>${appt.doctor.specialization}</small></td>
                <td style="padding: 1rem;">${appt.patient.name}<br><small>${appt.patient.email}</small></td>
                <td style="padding: 1rem;">${appt.appointmentDate}<br>${appt.startTime} - ${appt.endTime}</td>
                <td style="padding: 1rem;">
                    <span style="
                        padding: 0.25rem 0.5rem; 
                        border-radius: 4px; 
                        background: ${getColorForStatus(appt.status)}; 
                        color: white; 
                        font-size: 0.8rem;">
                        ${appt.status}
                    </span>
                </td>
                <td style="padding: 1rem;">
                    <select onchange="updateStatus(${appt.id}, this.value)" style="padding: 0.5rem;">
                        <option value="" disabled selected>Change Status</option>
                        <option value="BOOKED">BOOKED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        list.innerHTML = '<tr><td colspan="6" style="color:red;">Error loading appointments.</td></tr>';
    }
}

async function updateStatus(id, newStatus) {
    if (!newStatus) return;

    try {
        const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            // Refresh to show updated status pill
            fetchAppointments();
        } else {
            const errorText = await response.text();
            console.error('Update failed:', errorText);
            alert(`Failed to update status: ${errorText}`);
        }
    } catch (e) {
        console.error(e);
        alert('Network error: ' + e.message);
    }
}

function getColorForStatus(status) {
    switch (status) {
        case 'BOOKED': return '#27ae60'; // Green
        case 'CANCELLED': return '#e74c3c'; // Red
        case 'COMPLETED': return '#3498db'; // Blue
        default: return '#95a5a6'; // Gray
    }
}
