const API_BASE_URL = 'http://localhost:8081/api';

document.getElementById('add-doctor-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const specialization = document.getElementById('specialization').value;
    // Append seconds to time input value as LocalTime expects HH:mm:ss
    const workingStartTime = document.getElementById('workingStartTime').value + ':00';
    const workingEndTime = document.getElementById('workingEndTime').value + ':00';

    const doctorData = {
        name,
        specialization,
        workingStartTime,
        workingEndTime
    };

    try {
        const response = await fetch(`${API_BASE_URL}/doctors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doctorData)
        });

        if (response.ok) {
            showMessage('Doctor added successfully!', 'success');
            document.getElementById('add-doctor-form').reset();
        } else {
            const error = await response.json();
            showMessage('Failed to add doctor: ' + (error.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        showMessage('Network error. Check backend connection.', 'error');
        console.error(error);
    }
});

function showMessage(msg, type) {
    const container = document.getElementById('message-container');
    container.innerHTML = `<div class="${type === 'error' ? 'error-msg' : 'success-msg'}">${msg}</div>`;
}
