let attempts = 0;
const maxAttempts = 5;
const lockTime = 5 * 60 * 1000; // 5 minutos en milisegundos
let lockTimeout;

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === "admin" && password === "admin") {
        alert("Inicio de sesión exitoso");
        window.location.href = "index.html"; 
        
    } else {
        attempts++;
        if (attempts >= maxAttempts) {
            lockForm();
        } else {
            showModal();
        }
    }
});

function showModal() {
    const modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modal.show();
    document.getElementById('retryBtn').addEventListener('click', function () {
        location.reload();
    });
}

function lockForm() {
    alert("Ha excedido el número máximo de intentos. Espere 5 minutos para intentarlo nuevamente.");
    document.getElementById('username').disabled = true;
    document.getElementById('password').disabled = true;
    document.querySelector('button[type="submit"]').disabled = true;

    lockTimeout = setTimeout(() => {
        alert("Ahora puede intentar iniciar sesión nuevamente.");
        document.getElementById('username').disabled = false;
        document.getElementById('password').disabled = false;
        document.querySelector('button[type="submit"]').disabled = false;
        attempts = 0;
    }, lockTime);
}
