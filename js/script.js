// --- Funciones Generales ---

function showMessage(elementId, message, type) {
    const messageArea = document.getElementById(elementId);
    messageArea.textContent = message;
    messageArea.className = `message-area ${type}`; // Reemplaza todas las clases
    messageArea.classList.add('visible'); // Para transiciones de CSS
    messageArea.style.display = 'block';

    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        messageArea.classList.remove('visible');
        // Usar un pequeño retraso para asegurar que la transición de CSS se complete antes de ocultar
        setTimeout(() => {
            messageArea.style.display = 'none';
            messageArea.textContent = '';
            messageArea.className = 'message-area';
        }, 300); // Coincide con la duración de la transición en CSS
    }, 5000);
}

function togglePasswordVisibility(id) {
    const input = document.getElementById(id);
    const toggleSpan = input.nextElementSibling; // Asume que el span está justo después

    if (input.type === 'password') {
        input.type = 'text';
        toggleSpan.textContent = '🙈'; // Icono de ojo cerrado
    } else {
        input.type = 'password';
        toggleSpan.textContent = '👁️'; // Icono de ojo abierto
    }
}

// --- Funciones para index.html (Login y Registro) ---

// Se ejecuta solo si estamos en index.html o la raíz del dominio
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        const recoveryOverlay = document.getElementById('recovery-overlay');
        const messageArea = document.getElementById('message-area');

        const registerEmail = document.getElementById('register-email');
        const registerPassword = document.getElementById('register-password');
        const confirmPassword = document.getElementById('confirm-password');
        const registerButton = document.getElementById('register-button');

        const loginEmail = document.getElementById('login-email');
        const loginPassword = document.getElementById('login-password');
        const loginButton = document.getElementById('login-button');
        const loginRemember = document.getElementById('login-remember');

        const recoveryEmailInput = document.getElementById('recovery-email');
        const sendCodeButton = document.getElementById('send-code-button');
        const recoveryCodeInput = document.getElementById('recovery-code');
        const verifyCodeButton = document.getElementById('verify-code-button');
        const newPasswordInput = document.getElementById('new-password');
        const confirmNewPasswordInput = document.getElementById('confirm-new-password');
        const resetPasswordButton = document.getElementById('reset-password-button');
        const recoveryMessageArea = document.getElementById('recovery-message');

        let currentRecoveryCode = null; // Para almacenar el código de recuperación simulado
        let currentRecoveryEmail = null; // Para almacenar el correo de recuperación simulado

        // Función para cambiar entre secciones de login/registro
        window.showSection = function(sectionId, clickedButton) {
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');

            document.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('active');
            });
            clickedButton.classList.add('active'); // Activar el botón clicado
            messageArea.style.display = 'none'; // Ocultar mensajes al cambiar de sección
            messageArea.classList.remove('visible');
        };

        // Simulación de "hash" de contraseña (¡NO USAR EN PRODUCCIÓN REAL!)
        function simpleHash(password) {
            return btoa(password); // Codifica Base64. Es solo para simular un "hash"
        }

        // --- Lógica de Registro ---
        registerButton.addEventListener('click', () => {
            const email = registerEmail.value.trim();
            const password = registerPassword.value;
            const confirmPass = confirmPassword.value;

            if (!email || !password || !confirmPass) {
                showMessage('message-area', 'Todos los campos son obligatorios.', 'error');
                return;
            }

            // Validar formato de email
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(email)) {
                showMessage('message-area', 'Formato de correo electrónico inválido.', 'error');
                return;
            }

            // Validar fortaleza de la contraseña
            // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_+=]).{8,}$/;
            if (!passwordRegex.test(password)) {
                showMessage('message-area', 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.', 'error');
                return;
            }

            if (password !== confirmPass) {
                showMessage('message-area', 'Las contraseñas no coinciden.', 'error');
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(user => user.email === email)) {
                showMessage('message-area', 'Este correo electrónico ya está registrado.', 'error');
                return;
            }

            users.push({ email: email, password: simpleHash(password) });
            localStorage.setItem('users', JSON.stringify(users));

            showMessage('message-area', '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');
            // Redirigir a login después de un breve momento
            setTimeout(() => {
                // Simular clic en el botón de "Iniciar Sesión" para cambiar la vista
                document.querySelector('.tab-button:first-child').click(); 
                registerEmail.value = '';
                registerPassword.value = '';
                confirmPassword.value = '';
            }, 1500);
        });

        // --- Lógica de Login ---
        loginButton.addEventListener('click', () => {
            const email = loginEmail.value.trim();
            const password = loginPassword.value;
            const rememberMe = loginRemember.checked;

            if (!email || !password) {
                showMessage('message-area', 'Por favor, introduce tu correo y contraseña.', 'error');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === simpleHash(password));

            if (user) {
                sessionStorage.setItem('loggedInUserEmail', user.email); // Mantener sesión en esta pestaña
                if (rememberMe) {
                    localStorage.setItem('rememberedUserEmail', user.email); // Recordar para futuras sesiones
                } else {
                    localStorage.removeItem('rememberedUserEmail');
                }
                showMessage('message-area', '¡Inicio de sesión exitoso!', 'success');
                setTimeout(() => {
                    window.location.href = 'cita.html'; // Redirigir a la página de citas
                }, 1000);
            } else {
                showMessage('message-area', 'Correo o contraseña incorrectos.', 'error');
            }
        });

        // --- Lógica de Recuperación de Contraseña ---
        window.showRecoverySection = function() {
            recoveryOverlay.classList.add('visible');
            document.getElementById('recovery-step1').style.display = 'block';
            document.getElementById('recovery-step2').style.display = 'none';
            document.getElementById('recovery-step3').style.display = 'none';
            recoveryMessageArea.style.display = 'none';
            recoveryMessageArea.classList.remove('visible');
            recoveryEmailInput.value = '';
            recoveryCodeInput.value = '';
            newPasswordInput.value = '';
            confirmNewPasswordInput.value = '';
        };

        window.closeRecoverySection = function() {
            recoveryOverlay.classList.remove('visible');
            // Resetear el estado del modal después de la transición
            setTimeout(() => {
                recoveryOverlay.style.display = 'none';
            }, 300);
        };

        sendCodeButton.addEventListener('click', () => {
            const email = recoveryEmailInput.value.trim();
            if (!email) {
                showMessage('recovery-message', 'Por favor, introduce tu correo electrónico.', 'error');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userExists = users.some(u => u.email === email);

            if (!userExists) {
                showMessage('recovery-message', 'Este correo electrónico no está registrado.', 'error');
                return;
            }

            currentRecoveryEmail = email;
            currentRecoveryCode = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
            console.log('Código de recuperación (simulado para ' + email + '):', currentRecoveryCode); // En una app real, esto se enviaría por email

            showMessage('recovery-message', `Se ha enviado un código a su correo electrónico. Revise su bandeja de entrada.`, 'success');
            document.getElementById('recovery-step1').style.display = 'none';
            document.getElementById('recovery-step2').style.display = 'block';
        });

        verifyCodeButton.addEventListener('click', () => {
            const enteredCode = recoveryCodeInput.value.trim();

            if (enteredCode === currentRecoveryCode) {
                showMessage('recovery-message', 'Código verificado exitosamente.', 'success');
                document.getElementById('recovery-step2').style.display = 'none';
                document.getElementById('recovery-step3').style.display = 'block';
            } else {
                showMessage('recovery-message', 'Código incorrecto. Inténtelo de nuevo.', 'error');
            }
        });

        resetPasswordButton.addEventListener('click', () => {
            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;

            if (!newPassword || !confirmNewPassword) {
                showMessage('recovery-message', 'Ambos campos de contraseña son obligatorios.', 'error');
                return;
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_+=]).{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                showMessage('recovery-message', 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.', 'error');
                return;
            }

            if (newPassword !== confirmNewPassword) {
                showMessage('recovery-message', 'Las contraseñas no coinciden.', 'error');
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === currentRecoveryEmail);

            if (userIndex !== -1) {
                users[userIndex].password = simpleHash(newPassword);
                localStorage.setItem('users', JSON.stringify(users));
                showMessage('recovery-message', '¡Recuperación Exitosa! Su contraseña ha sido actualizada.', 'success');
                
                // Limpiar variables de recuperación y cerrar modal
                currentRecoveryCode = null;
                currentRecoveryEmail = null;
                setTimeout(() => {
                    closeRecoverySection();
                    loginEmail.value = users[userIndex].email; // Pre-llenar email en login
                    loginPassword.value = ''; // Vaciar contraseña
                    showMessage('message-area', 'Ahora puede iniciar sesión con su nueva contraseña.', 'success');
                }, 2000);
            } else {
                showMessage('recovery-message', 'Error: Usuario no encontrado.', 'error');
            }
        });

        // Cargar el correo si "recordarme" fue seleccionado
        const rememberedEmail = localStorage.getItem('rememberedUserEmail');
        if (rememberedEmail) {
            loginEmail.value = rememberedEmail;
            loginRemember.checked = true;
        }
    });
}

// --- Funciones para cita.html (Registro de Cita) ---

// Se ejecuta si estamos en cita.html
if (window.location.pathname.endsWith('cita.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

        // Si no hay usuario logueado, redirigir a index.html
        if (!loggedInUserEmail) {
            window.location.href = 'index.html';
            return;
        }

        const appointmentForm = document.getElementById('appointment-form');
        const ownerNameInput = document.getElementById('owner-name');
        const petNameInput = document.getElementById('pet-name');
        const petGenderSelect = document.getElementById('pet-gender');
        const petBreedInput = document.getElementById('pet-breed'); // Ahora es un input text con datalist
        const veterinarianSelect = document.getElementById('veterinarian');
        const consultReasonInput = document.getElementById('consult-reason');
        const appointmentDateInput = document.getElementById('appointment-date');
        const appointmentTimeInput = document.getElementById('appointment-time');
        const confirmationModal = document.getElementById('confirmation-modal');
        const appointmentMessageArea = document.getElementById('appointment-message-area');

        appointmentForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evitar el envío por defecto del formulario

            const ownerName = ownerNameInput.value.trim();
            const petName = petNameInput.value.trim();
            const petGender = petGenderSelect.value;
            const petBreed = petBreedInput.value.trim(); // Obtener el valor del input
            const veterinarian = veterinarianSelect.value;
            const consultReason = consultReasonInput.value.trim();
            const appointmentDate = appointmentDateInput.value;
            const appointmentTime = appointmentTimeInput.value;

            if (!ownerName || !petName || !petGender || !petBreed || !veterinarian || !consultReason || !appointmentDate || !appointmentTime) {
                showMessage('appointment-message-area', 'Todos los campos son obligatorios.', 'error');
                return;
            }

            // Validar que la fecha y hora no sea pasada
            const appointmentDatetimeCombined = `${appointmentDate}T${appointmentTime}`;
            const selectedDateTime = new Date(appointmentDatetimeCombined);
            const now = new Date();
            
            // Para asegurar que no se pueda seleccionar un segundo o minuto que ya pasó, ajustamos un poco
            // Compara la fecha y hora completa
            if (selectedDateTime <= now) {
                showMessage('appointment-message-area', 'La fecha y hora de la cita debe ser en el futuro.', 'error');
                return;
            }

            // Generar un ID de ficha aleatorio (simulado)
            const fichaId = Math.floor(1000 + Math.random() * 9000);

            // Rellenar el modal de confirmación
            document.getElementById('confirm-owner-name').textContent = ownerName;
            document.getElementById('confirm-pet-name-paragraph').textContent = petName; 
            document.getElementById('confirm-ficha').textContent = fichaId;
            document.getElementById('confirm-datetime').textContent = selectedDateTime.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });
            document.getElementById('confirm-veterinarian-detail').textContent = veterinarian; // Nuevo ID para el detalle del veterinario
            document.getElementById('confirm-reason').textContent = consultReason;
            document.getElementById('confirm-pet-name-detail').textContent = petName;
            document.getElementById('confirm-pet-gender').textContent = petGender;
            document.getElementById('confirm-pet-breed').textContent = petBreed; // Mostrar la raza
            document.getElementById('confirm-email').textContent = loggedInUserEmail;

            // Mostrar el modal
            confirmationModal.classList.add('visible');
        });

        // Función para cerrar el modal de confirmación
        window.closeConfirmationModal = function() {
            confirmationModal.classList.remove('visible');
            // Resetear el estado del modal después de la transición
            setTimeout(() => {
                confirmationModal.style.display = 'none';
            }, 300);
            appointmentForm.reset(); // Limpiar el formulario
            showMessage('appointment-message-area', '¡Cita solicitada con éxito!', 'success');
        };

        // Función para imprimir la confirmación
        window.printConfirmation = function() {
            const printContent = document.getElementById('printable-area').innerHTML;
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Factura de Cita VetCare</title>
                    <link rel="stylesheet" href="style.css">
                    <style>
                        /* Estilos específicos para la impresión dentro de la ventana de impresión */
                        body { margin: 0; padding: 20px; font-family: 'Poppins', sans-serif; color: #333; }
                        .modal-content {
                            box-shadow: none; border: 1px solid #ccc; border-radius: 8px; padding: 20px;
                            max-width: 600px; margin: 0 auto;
                        }
                        .modal-header-print {
                            display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
                            border-bottom: 1px solid #eee; padding-bottom: 15px;
                        }
                        .vetcare-logo-small { width: 50px; height: 50px; margin-right: 10px; border-radius: 50%; object-fit: cover; }
                        h3 { margin: 0; font-size: 1.5em; color: #000; }
                        p { font-size: 0.9em; color: #666; margin-top: 5px; margin-left: 10px; }
                        .appointment-details-list { list-style-type: none; padding: 0; text-align: left; margin-top: 20px; }
                        .appointment-details-list li { margin-bottom: 8px; font-size: 1.05em; }
                        .appointment-details-list li strong { color: #0056b3; }
                        .small-text { font-size: 0.85em; color: #888; margin-top: 25px; text-align: center; }
                        .modal-actions { display: none; } /* Ocultar botones en la impresión */
                        @media print {
                            body { -webkit-print-color-adjust: exact; } /* Para imprimir colores de fondo */
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        };

        // Función para cerrar sesión
        window.logout = function() {
            sessionStorage.removeItem('loggedInUserEmail'); // Eliminar la sesión actual
            localStorage.removeItem('rememberedUserEmail'); // Eliminar "recordarme" si existía
            window.location.href = 'index.html'; // Redirigir a la página de login
        };
    });
}