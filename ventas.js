 // Variable global para almacenar el intervalo de actualización del tiempo
let intervaloTiempoRestante;
 
 
 // Mostrar el modal al cargar la página
 window.onload = function() {
    document.getElementById('loginModal').style.display = 'flex';  // Muestra el modal
};

// Función para validar el login con cifrado
async function validarLogin(event) {
    event.preventDefault(); // Evita la recarga de la página al enviar el formulario

    // Datos de usuario y contraseña predefinidos, ambos cifrados
    const predefinedUserEncrypted = '004528c3be8c04503504cdfa885db977a4956d3292f58367c7eb1523b2e70d9a'; // '29727010' cifrado en SHA-256
    const predefinedPasswordEncrypted = '480d80305cfc0d44b53bc03117797140356d10012eff27edb7f5e57ebda98266'; // 'Delia1206' cifrado en SHA-256

    // Obtener los valores del formulario
    const usuario = document.getElementById('usuario').value;
    const contraseña = document.getElementById('password').value;

    // Convertir el nombre de usuario y la contraseña a un ArrayBuffer
    const encoder = new TextEncoder();
    const usernameData = encoder.encode(usuario);
    const passwordData = encoder.encode(contraseña);

    // Cifrar el nombre de usuario y la contraseña con SHA-256 usando la Web Crypto API
    const usernameHashBuffer = await crypto.subtle.digest('SHA-256', usernameData); // Cifrar usuario
    const passwordHashBuffer = await crypto.subtle.digest('SHA-256', passwordData); // Cifrar contraseña

    // Convertir los ArrayBuffer a un array de bytes
    const usernameHashArray = Array.from(new Uint8Array(usernameHashBuffer));
    const passwordHashArray = Array.from(new Uint8Array(passwordHashBuffer));

    // Convertir a formato hexadecimal
    const encryptedUsername = usernameHashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    const encryptedPassword = passwordHashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    // Validar si el usuario y la contraseña cifrada coinciden con los valores predefinidos
    if (encryptedUsername === predefinedUserEncrypted && encryptedPassword === predefinedPasswordEncrypted) {
        // Ocultar el modal
        document.getElementById('loginModal').style.display = 'none';
        
        // Mostrar el historial de ventas
        document.getElementById('ventas').style.display = 'block';
        
        // Llamar a la función para mostrar el historial de ventas
        mostrarHistorialVentas();
    } else {
        // Mostrar mensaje de error
        document.getElementById('error').style.display = 'inline';
    }
}

// Función para guardar la venta en el historial
function guardarVentaEnHistorial(venta) {
    const historialVentas = JSON.parse(localStorage.getItem("historialVentas")) || [];

    // Eliminar expiración incorrecta y establecer una nueva (15 días)
localStorage.removeItem("fechaExpiracion");
const fechaExpiracion = new Date().getTime() + (15 * 24 * 60 * 60 * 1000); // 15 días en milisegundos
localStorage.setItem("fechaExpiracion", fechaExpiracion.toString());


    // Agregar la venta al historial
    historialVentas.push(venta);

    // Guardar el historial actualizado
    localStorage.setItem("historialVentas", JSON.stringify(historialVentas));

    // Depuración
    console.log("Historial de ventas actualizado:", JSON.parse(localStorage.getItem("historialVentas")));
    console.log("Fecha de expiración configurada:", localStorage.getItem("fechaExpiracion"));

    // Actualizar la interfaz
    mostrarHistorialVentas();
}

// Función para mostrar el historial de ventas
function mostrarHistorialVentas() {
    const historialVentas = JSON.parse(localStorage.getItem("historialVentas")) || [];
    const historialVentasContainer = document.getElementById("historialVentas");

    

    // Verifica si el historial está vacío
    if (historialVentas.length === 0) {
        historialVentasContainer.innerHTML = "<p>No hay ventas registradas.</p>";
    } else {
        let tablaHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Venta #</th>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Monto del cliente</th>
                        <th>Cambio</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Iterar sobre las ventas y agregar filas a la tabla
        historialVentas.forEach((venta, index) => {
            const fecha = venta.fecha;
            const total = venta.total.toFixed(2);

            const montoCliente = (typeof venta.montoCliente === 'number' && !isNaN(venta.montoCliente)) ? venta.montoCliente.toFixed(2) : "N/A";
            const cambio = (typeof venta.cambio === 'number' && !isNaN(venta.cambio)) ? venta.cambio.toFixed(2) : "N/A";
            const productos = venta.productos.map(p => `${p.nombre} (Cantidad: ${p.cantidad})`).join("<br>");

            tablaHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${fecha}</td>
                    <td>${productos}</td>
                    <td>S/${total}</td>
                    <td>S/${montoCliente}</td>
                    <td>S/${cambio}</td>
                </tr>
            `;
        });

        tablaHTML += `</tbody></table>`;
        historialVentasContainer.innerHTML = tablaHTML;
    }
}

// Función para mostrar el tiempo restante de manera profesional
function mostrarTiempoRestante() {
    const fechaExpiracion = localStorage.getItem("fechaExpiracion");
    const tiempoRestanteElement = document.getElementById("tiempoRestante");

    if (fechaExpiracion) {
        // Convertir la fecha de expiración a un número (milisegundos)
        const tiempoRestante = parseInt(fechaExpiracion) - new Date().getTime();

        if (tiempoRestante <= 0) {
            // El historial ha expirado, limpiamos el localStorage
            localStorage.removeItem("historialVentas");
            localStorage.removeItem("fechaExpiracion");

            // Ocultar el tiempo restante
            tiempoRestanteElement.textContent = "";
            tiempoRestanteElement.classList.remove("expired");

            // Limpiar el contenedor de ventas
            const historialVentasContainer = document.getElementById("historialVentas");
            historialVentasContainer.innerHTML = "<p>El historial de ventas ha expirado.</p>";

            setTimeout(() => {
                location.reload(); // Recarga la página después de 2 segundos
            }, 2000);
        } else {
            // Calcular días, horas, minutos y segundos
            const segundosRestantes = Math.ceil(tiempoRestante / 1000); // Convertir a segundos
            const diasRestantes = Math.floor(segundosRestantes / (24 * 60 * 60)); // Convertir a días
            const horasRestantes = Math.floor((segundosRestantes % (24 * 60 * 60)) / 3600); // Convertir a horas
            const minutosRestantes = Math.floor((segundosRestantes % 3600) / 60); // Convertir a minutos
            const segundos = segundosRestantes % 60; // Segundos restantes después de los minutos

            // Verificar si se debe mostrar días, horas, minutos y segundos o solo minutos y segundos
            let tiempoText = "";
            
            // Si el tiempo restante es mayor a un día, mostrar días, horas, minutos y segundos
            if (diasRestantes > 0) {
                tiempoText = `El historial se borrará en ${diasRestantes}d ${horasRestantes}h ${minutosRestantes}m ${segundos}s.`;
            } 
            // Si el tiempo restante es mayor a 0 horas pero menos de un día, mostrar horas, minutos y segundos
            else if (horasRestantes > 0) {
                tiempoText = `El historial se borrará en ${horasRestantes}h ${minutosRestantes}m ${segundos}s.`;
            } 
            // Si el tiempo restante es menos de una hora, solo mostrar minutos y segundos
            else {
                tiempoText = `El historial se borrará en ${minutosRestantes}m ${segundos}s.`;
            }

            tiempoRestanteElement.textContent = tiempoText;

            // Resaltar si quedan menos de 30 segundos
            if (segundosRestantes <= 30) {
                tiempoRestanteElement.classList.add("critical");
            } else {
                tiempoRestanteElement.classList.remove("critical");
            }
        }
    } else {
        // Si no hay fecha de expiración (esto puede ocurrir cuando se reinicia el historial)
        tiempoRestanteElement.textContent = ""; // No mostrar nada
        tiempoRestanteElement.classList.remove("expired", "critical", "stopped");
    }
}




// Iniciar el intervalo para actualizar el tiempo
intervaloTiempoRestante = setInterval(mostrarTiempoRestante, 1000); // Ejecuta la función cada 1 segundo


// Detener el intervalo de actualización del tiempo
function detenerIntervalo() {
    clearInterval(intervaloTiempoRestante);
}


// Mostrar el modal de login solo cuando se hace clic en "Reiniciar Historial"
document.getElementById("reiniciarHistorialButton").addEventListener("click", function() {
    // Ocultar el historial y el botón mientras se muestra el modal
    document.getElementById("ventas").style.display = 'none';  // Ocultar todo el historial de ventas
    document.getElementById("reiniciarHistorialModal").style.display = 'flex'; // Mostrar el modal
});

// Función para validar login antes de reiniciar historial
async function validarLoginReinicio(event) {
    event.preventDefault(); // Evita la recarga de la página al enviar el formulario

    // Datos de usuario y contraseña predefinidos (puedes cifrarlos si lo prefieres)
    const predefinedUserEncrypted = '004528c3be8c04503504cdfa885db977a4956d3292f58367c7eb1523b2e70d9a'; // '29727010' cifrado en SHA-256
    const predefinedPasswordEncrypted = '0bc89d4c68c6ec7fbf571d0f74b1e09cbd707194ea3768ba9aa9f87b8510b030'; // 'DD2B' cifrado en SHA-256

    // Obtener los valores del formulario
    const usuario = document.getElementById('usuarioReinicio').value;
    const contraseña = document.getElementById('passwordReinicio').value;

    // Convertir el nombre de usuario y la contraseña a un ArrayBuffer
    const encoder = new TextEncoder();
    const usernameData = encoder.encode(usuario);
    const passwordData = encoder.encode(contraseña);

    // Cifrar el nombre de usuario y la contraseña con SHA-256 usando la Web Crypto API
    const usernameHashBuffer = await crypto.subtle.digest('SHA-256', usernameData); // Cifrar usuario
    const passwordHashBuffer = await crypto.subtle.digest('SHA-256', passwordData); // Cifrar contraseña

    // Convertir los ArrayBuffer a un array de bytes
    const usernameHashArray = Array.from(new Uint8Array(usernameHashBuffer));
    const passwordHashArray = Array.from(new Uint8Array(passwordHashBuffer));

    // Convertir a formato hexadecimal
    const encryptedUsername = usernameHashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    const encryptedPassword = passwordHashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    // Validar si el usuario y la contraseña cifrada coinciden con los valores predefinidos
    if (encryptedUsername === predefinedUserEncrypted && encryptedPassword === predefinedPasswordEncrypted) {
        // Reiniciar el historial
        reiniciarHistorial();

        // Ocultar el modal de login para reiniciar historial
        document.getElementById("reiniciarHistorialModal").style.display = 'none';

        // Mostrar el historial de ventas y el botón de reiniciar
        document.getElementById("ventas").style.display = 'block'; // Mostrar historial de ventas

        // Mostrar un mensaje de éxito
        alert("Historial reiniciado exitosamente.");
    } else {
        // Mostrar mensaje de error
        document.getElementById("errorReinicio").style.display = 'inline';
    }
}

// Función para reiniciar el historial
function reiniciarHistorial() {
    // Eliminar historial de ventas
    localStorage.removeItem("historialVentas");

    // Detener el intervalo
    detenerIntervalo();

    // Establecer una nueva fecha de expiración en el futuro (no queremos que el tiempo corra ahora)
    const fechaExpiracionDetenida = new Date().getTime() + (15 * 24 * 60 * 60 * 1000); // 15 días en milisegundos
    localStorage.setItem("fechaExpiracion", fechaExpiracionDetenida.toString());

    // Limpiar el contenedor de ventas
    const historialVentasContainer = document.getElementById("historialVentas");
    historialVentasContainer.innerHTML = "<p>El historial de ventas ha sido borrado y el tiempo se ha detenido.</p>";

    // Limpiar el tiempo restante
    const tiempoRestanteElement = document.getElementById("tiempoRestante");
    tiempoRestanteElement.textContent = ""; // No mostrar nada de tiempo

    // Asegurarnos de que el intervalo de tiempo no comience hasta que sea necesario
    mostrarTiempoRestante(); // Mostrar el estado del tiempo si se requiere.
}

// Asociar la función al evento de login para reiniciar historial
document.getElementById("confirmarReinicio").addEventListener("click", validarLoginReinicio);

// Asociar el evento del botón al iniciar sesión
document.getElementById('loginButton').addEventListener('click', validarLogin);



document.getElementById('descargarPdfButton').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;  // Crea una nueva instancia de jsPDF
    const doc = new jsPDF();  // Crea una nueva instancia de jsPDF

    // Obtén el contenedor de historial de ventas
    const historialVentasContainer = document.getElementById("historialVentas");

    // Verifica si la tabla está vacía
    if (historialVentasContainer.innerHTML.includes('No hay ventas registradas.')) {
        doc.text("No hay ventas registradas.", 10, 10);
        doc.save('historial_ventas.pdf'); // Guarda el PDF
        return;
    }

    // Añadir el título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("Historial de Ventas", 14, 20);

    // Añadir el contenido de la tabla
    doc.setFontSize(12);
    const tablaRows = [];
    const rows = historialVentasContainer.querySelectorAll("table tbody tr");

    // Recopilar las filas de la tabla
    rows.forEach((row) => {
        const columns = row.querySelectorAll("td");
        const rowData = Array.from(columns).map(col => col.textContent.trim());
        tablaRows.push(rowData);
    });

    // Definir las columnas de la tabla
    const columnas = ["Venta #", "Fecha", "Productos", "Total", "Monto Cliente", "Cambio"];

    // Agregar la tabla al PDF usando autoTable
    doc.autoTable({
        head: [columnas], // Cabecera de la tabla
        body: tablaRows, // Filas de la tabla
        startY: 30, // Iniciar la tabla 30px abajo del título
        theme: 'striped', // Estilo de la tabla
        margin: { horizontal: 10 }, // Márgenes
    });

    // Descargar el PDF con el nombre de "historial_ventas.pdf"
    doc.save('historial_ventas.pdf');
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

