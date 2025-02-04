document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Datos de usuario y contraseña predefinidos, ambos cifrados
    const predefinedUserEncrypted = '004528c3be8c04503504cdfa885db977a4956d3292f58367c7eb1523b2e70d9a'; // '29727010' cifrado en SHA-256
    const predefinedPasswordEncrypted = '9a5e35d0a6d7f3a9cf85538e7f5e0302e508d98f0b551c99fc94f1d594f32468'; // 'Delia29727010' cifrado en SHA-256

    // Obtener los valores del formulario
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Convertir el nombre de usuario y la contraseña a un ArrayBuffer
    const encoder = new TextEncoder();
    const usernameData = encoder.encode(username);
    const passwordData = encoder.encode(password);

    // Cifrar el nombre de usuario y la contraseña con SHA-256 usando la Web Crypto API
    const usernameHashBuffer = await crypto.subtle.digest('SHA-256', usernameData); // Cifrar usuario
    const passwordHashBuffer = await crypto.subtle.digest('SHA-256', passwordData); // Cifrar contraseña

    // Convertir los ArrayBuffer a un array de bytes
    const usernameHashArray = Array.from(new Uint8Array(usernameHashBuffer));
    const passwordHashArray = Array.from(new Uint8Array(passwordHashBuffer));

    // Convertir a formato hexadecimal
    const encryptedUsername = usernameHashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    const encryptedPassword = passwordHashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    console.log("Nombre de usuario cifrado:", encryptedUsername);  // Para depurar y ver el nombre de usuario cifrado
    console.log("Contraseña cifrada:", encryptedPassword); // Para depurar y ver la contraseña cifrada

    // Validar si el usuario y la contraseña cifrada coinciden con los valores predefinidos
    if (encryptedUsername === predefinedUserEncrypted && encryptedPassword === predefinedPasswordEncrypted) {
        alert('Bienvenido al sistema de Minimarket');
        window.location.href = "principal.html"; // Redirigir a la página principal
    } else {
        document.getElementById('error-message').innerText = 'Usuario o contraseña incorrectos';
    }
});


document.addEventListener('keydown', function(event) {
    // Asegúrate de que event.key sea una cadena antes de llamar a .toLowerCase()
    const key = typeof event.key === 'string' ? event.key.toLowerCase() : '';

    // Prevenir Ctrl + U, Ctrl + S, Ctrl + I (sin importar mayúsculas o minúsculas)
    if (event.ctrlKey && (key === 'u' || key === 's' || key === 'i')) {
        event.preventDefault();
        console.log(key + " detectado y prevenido");
    }

    // Prevenir F12
    if (event.key === 'F12') {
        event.preventDefault();
        console.log('F12 detectado y prevenido');
    }

    // Prevenir Ctrl + Shift + I (Inspeccionar)
    if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        console.log('Ctrl + Shift + I detectado y prevenido');
    }
});


document.addEventListener('selectstart', function(event) {
    event.preventDefault();
});

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
   
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'F10') {
        event.preventDefault(); // Bloquear la acción predeterminada de F10
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'F12') {
        event.preventDefault(); // Bloquear la acción predeterminada de F12
    }
});
