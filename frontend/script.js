// Global variables
let qrData = null;
let html5QrcodeScanner = null;

// Form switching functions
function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    loginForm.classList.add('slide-up');
}

function showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    registerForm.classList.add('slide-up');
}

// Authentication functions
async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showNotification("Please enter both username and password", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            showNotification("Login successful!", "success");
            // Store user session
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            document.querySelector('.auth-container').style.display = 'none';
        } else {
            showNotification(data.message || "Login failed!", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showNotification("Failed to login. Please try again.", "error");
    }
}

async function handleRegister() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (!username || !password || !confirmPassword) {
        showNotification("Please fill in all fields", "error");
        return;
    }

    if (password !== confirmPassword) {
        showNotification("Passwords do not match", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            showNotification("Registration successful! Please login.", "success");
            showLoginForm();
        } else {
            showNotification(data.message || "Registration failed!", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showNotification("Failed to register. Please try again.", "error");
    }
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// QR Scanner functions
function handleScanQR() {
    const qrReader = document.getElementById('qr-reader');
    const authContainer = document.querySelector('.auth-container');
    
    if (qrReader.style.display === 'none') {
        if (!sessionStorage.getItem('isLoggedIn')) {
            showNotification("Please login first!", "error");
            return;
        }
        qrReader.style.display = 'block';
        authContainer.style.display = 'none';
        startQRScanner();
    } else {
        stopQRScanner();
        qrReader.style.display = 'none';
        if (!sessionStorage.getItem('isLoggedIn')) {
            authContainer.style.display = 'block';
        }
    }
}

function startQRScanner() {
    html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
            fps: 10, 
            qrbox: {width: 250, height: 250},
            aspectRatio: 1.0
        },
        false
    );
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

function stopQRScanner() {
    if (html5QrcodeScanner) {
        try {
            html5QrcodeScanner.clear();
        } catch (error) {
            console.error("Error stopping scanner:", error);
        }
    }
}

function onScanSuccess(decodedText, decodedResult) {
    qrData = decodedText;
    document.getElementById('qr-reader-results').innerHTML = 
        `<div class="success-message">
            <p>QR Code Scanned Successfully!</p>
            <p>Data: ${decodedText}</p>
            <button onclick="handleAttendance()" class="mark-attendance-btn">
                Mark Attendance
            </button>
        </div>`;
    stopQRScanner();
    
    document.getElementById('qr-reader').style.display = 'none';
    // Get location after successful QR scan
    getLocation();
}

function onScanFailure(error) {
    // Only log critical errors
    if (error?.message?.includes('NotFound') || error?.message?.includes('NotAllowed')) {
        console.error("QR Scanner Error:", error);
    }
}

// Location verification functions
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function success(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    
    console.log("Current Location: ", lat, lon);

    // Compare with pre-defined allowed location
    let allowedLat = 21.1904; // Example coordinates
    let allowedLon = 81.2849;

    let distance = getDistance(lat, lon, allowedLat, allowedLon);
    if (distance <= 0.1) {  // 100 meters radius
        alert("Location Verified ✅");
        sessionStorage.setItem('locationVerified', 'true');
    } else {
        alert("You are not in the allowed location ❌");
        sessionStorage.setItem('locationVerified', 'false');
    }
}

function getDistance(lat1, lon1, lat2, lon2) {
    let R = 6371; // Radius of Earth in km
    let dLat = (lat2 - lat1) * (Math.PI / 180);
    let dLon = (lon2 - lon1) * (Math.PI / 180);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;  // Distance in km
}

function error() {
    alert("Unable to retrieve location.");
    sessionStorage.setItem('locationVerified', 'false');
}

// Attendance functions
async function handleAttendance() {
    if (!sessionStorage.getItem('isLoggedIn')) {
        alert("Please login first!");
        return;
    }

    if (!qrData) {
        alert("Please scan a QR code first!");
        return;
    }

    if (sessionStorage.getItem('locationVerified') !== 'true') {
        alert("Please verify your location first!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/mark-attendance", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem('username')}`
            },
            body: JSON.stringify({ 
                qrData: qrData,
                username: sessionStorage.getItem('username')
            })
        });

        const data = await response.json();
        alert(data.message);
        // Reset QR data after successful attendance
        qrData = null;
        document.getElementById('qr-reader-results').innerHTML = '';
        sessionStorage.removeItem('locationVerified');
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to mark attendance.");
    }
}

// Initialize on page load
window.onload = function() {
    if (sessionStorage.getItem('isLoggedIn')) {
        document.querySelector('.auth-container').style.display = 'none';
    }
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            background-color: var(--success-color);
        }
        
        .notification.error {
            background-color: #dc3545;
        }
        
        .notification.info {
            background-color: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
}
