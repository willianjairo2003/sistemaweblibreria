// Cargar los productos desde el localStorage o un arreglo vacío si no existen productos guardados
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || []; // Carrito de compras almacenado en localStorage

// Obtener referencias a los elementos del DOM
const pantalla = document.querySelector(".pantalla");
const montoClienteInput = document.getElementById("monto");
const cambioElemento = document.getElementById("cambio");
const listaProductos = document.getElementById("lista-productos");
const totalElemento = document.getElementById("total");
const cantidadProductosElemento = document.getElementById("cantidad-productos"); // Referencia al elemento donde se mostrará la cantidad de productos
const botonProcesarCompra = document.getElementById("procesar");

// Función para mostrar el inventario actual
function mostrarInventario() {
    console.log("Inventario cargado: ", productos);
}

// Función para escanear productos
function escanearProducto(codigo, inputElement) {
    const producto = productos.find(p => p.codigo === codigo);
    
    if (producto) {
        agregarProductoAlCarrito(producto);  // Si lo encuentra, agrega el producto al carrito
        inputElement.value = "";  // Limpiar el campo de entrada después de procesar
    }
}

function agregarProductoAlCarrito(producto) {
    const cantidadRestante = producto.cantidad - (producto.cantidadVendida || 0);
    
    if (cantidadRestante <= 0) {
        alert("Este producto está agotado y no se puede agregar al carrito.");
        return; // No agregar el producto si está agotado
    }

    const productoCarrito = carrito.find(p => p.codigo === producto.codigo);

    if (productoCarrito) {
        productoCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    // Guardar el carrito en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Actualizar el inventario (disminuir la cantidad disponible en el inventario)
    actualizarCantidadVendida(producto.codigo, 1); // Suponiendo que estamos vendiendo 1 unidad

    mostrarCarrito();
}


// Función para eliminar un producto del carrito
function eliminarProductoDelCarrito(codigo) {
    const productoCarrito = carrito.find(p => p.codigo === codigo);

    if (productoCarrito) {
        // Decrementamos la cantidad vendida en el inventario cuando se elimina un producto del carrito
        actualizarCantidadVendida(codigo, -productoCarrito.cantidad);
    }

    carrito = carrito.filter(p => p.codigo !== codigo); // Eliminar producto con el código especificado

    // Guardar el carrito en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito(); // Volver a mostrar el carrito actualizado
}

// Función para mostrar el carrito de compras
function mostrarCarrito() {
    listaProductos.innerHTML = ""; // Limpiar la lista actual

    let total = 0;
    let cantidadTotal = 0; // Variable para almacenar la cantidad total de productos

    carrito.forEach((producto) => {
        const productoElemento = document.createElement("div");
        productoElemento.classList.add("producto");
        
        productoElemento.innerHTML = `
            <span>${producto.nombre}</span> 
            <span>Cantidad: ${producto.cantidad}</span> 
            <span>Precio: S/${(producto.precio * producto.cantidad).toFixed(2)}</span>
            <button class="eliminar" data-codigo="${producto.codigo}">X</button>
        `;

        listaProductos.appendChild(productoElemento);

        total += producto.precio * producto.cantidad;
        cantidadTotal += producto.cantidad; // Sumar la cantidad de cada producto
    });

    totalElemento.textContent = `Total: S/${total.toFixed(2)}`;

    // Actualizar el elemento que muestra la cantidad total de productos
    if (cantidadProductosElemento) {
        cantidadProductosElemento.textContent = `Cantidad de productos: ${cantidadTotal}`;
    }

    // Añadir evento de eliminar producto al botón "X"
    const botonesEliminar = document.querySelectorAll(".eliminar");
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const codigoProducto = e.target.dataset.codigo;
            eliminarProductoDelCarrito(codigoProducto);
        });
    });
}

// Función para calcular el cambio
function calcularCambio() {
    const montoCliente = parseFloat(montoClienteInput.value) || 0;
    const total = carrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);

    const cambio = montoCliente - total;
    if (cambio >= 0) {
        cambioElemento.textContent = `Cambio: S/${cambio.toFixed(2)}`;
    } else {
        cambioElemento.textContent = `Faltan S/${Math.abs(cambio).toFixed(2)} para completar el pago.`;
    }
}

document.getElementById("codigo-barras").addEventListener("input", (e) => {
    const codigo = e.target.value.trim();  // Captura el código ingresado

    // Solo procesar si el código tiene al menos un carácter
    if (codigo.length > 0) {
        escanearProducto(codigo, e.target);  // Procesamos el código
    }
});




// Event listener para ingresar el monto del cliente
montoClienteInput.addEventListener("input", calcularCambio);



// Función para procesar la compra
botonProcesarCompra.addEventListener("click", function() {
    const montoCliente = parseFloat(montoClienteInput.value) || 0;
    const total = carrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);

    console.log("Monto Cliente:", montoCliente);  // Verificar montoCliente
    console.log("Total Carrito:", total);  // Verificar total

    if (montoCliente <= 0) {
        alert("Por favor ingresa un monto válido.");
        return;
    }

    if (montoCliente >= total) {
        alert("Compra procesada con éxito");

        // Crear un objeto para la venta con los productos del carrito y el total
        const venta = {
            productos: carrito,
            total: total,
            montoCliente: parseFloat(montoClienteInput.value) || 0,
            cambio: parseFloat(cambioElemento.textContent.replace('Cambio: S/', '').trim()) || 0,
            fecha: new Date().toLocaleString() // Fecha actual
        };

        // Obtener historial de ventas existente o crear uno nuevo
        let historialVentas = JSON.parse(localStorage.getItem("historialVentas")) || [];

        // Agregar la venta al historial
        historialVentas.push(venta);

        // Guardar el historial actualizado en localStorage
        localStorage.setItem("historialVentas", JSON.stringify(historialVentas));

        // Verificar si la fecha de expiración ya está configurada
        const fechaExpiracion = localStorage.getItem("fechaExpiracion");

        if (!fechaExpiracion) {
            // Configurar la fecha de expiración (10 dias) solo si no existe aún
            const nuevaFechaExpiracion = new Date().getTime() + (15 * 24 * 60 * 60 * 1000); // 15 días en milisegundos
            localStorage.setItem("fechaExpiracion", nuevaFechaExpiracion.toString());
        }

        // Vaciar el carrito y eliminarlo de localStorage
        carrito = [];
        localStorage.removeItem("carrito");

        // Reiniciar los campos
        montoClienteInput.value = "";
        cambioElemento.textContent = "Cambio: S/0.00";

        // Actualizar el carrito vacío y el historial
        mostrarCarrito();
        console.log("Mostrando historial de ventas después de la compra...");
        mostrarHistorialVentas(); // Actualizamos el historial después de la compra sin recargar la página
    } else {
        alert("El monto ingresado no es suficiente para completar la compra.");
    }
});


// Mostrar el inventario al cargar la página
mostrarInventario();

// Mostrar el carrito al cargar la página
mostrarCarrito(); // Asegurarse de que el carrito se muestre al cargar la página

// Lógica para la calculadora
const botones = document.querySelectorAll(".calculadora .btn"); // Seleccionar todos los botones
botones.forEach(boton => { 
    boton.addEventListener("click", () => { 
        const botonApretado = boton.textContent;

        if (boton.id === "c") {
            pantalla.textContent = "0";  // Limpiar pantalla al presionar 'C'
            return;
        }

        if (boton.id === "borrar") {
            if (pantalla.textContent.length === 1) {
                pantalla.textContent = "0"; // Si la pantalla tiene un solo dígito, reiniciamos
            } else {
                pantalla.textContent = pantalla.textContent.slice(0, -1); // Borramos el último dígito
            }
            return;
        }

        if (boton.id === "igual") {
            try {
                let resultado = eval(pantalla.textContent); // Evaluamos la operación
                if (typeof resultado === 'number') {
                    resultado = resultado.toFixed(2); // Redondeo a 2 decimales
                }
                pantalla.textContent = resultado; // Mostrar resultado en la pantalla

                // Agregar producto generado por la calculadora al carrito y a la lista de productos
                agregarProductoManual("Producto manual", parseFloat(resultado));

            } catch {
                pantalla.textContent = "Error!"; // Si hay un error en la operación
            }         
            return;
        }

        if (pantalla.textContent === "0") {
            pantalla.textContent = botonApretado;
        } else {
            pantalla.textContent += botonApretado; // De lo contrario, agregamos el valor presionado
        }
    });     
});

function agregarProductoManual(nombre, precio) {
    // Verificar que el precio sea mayor que 0
    if (precio <= 0) {
        alert("El precio debe ser mayor que 0.");
        return;
    }

    // Crear un objeto de producto a partir del resultado de la calculadora
    const nuevoProducto = {
        nombre: nombre,
        precio: precio,
        cantidad: 1,
        codigo: Date.now().toString() // Código único basado en la marca de tiempo
    };

    // Agregar el producto al carrito
    carrito.push(nuevoProducto);

    // Guardar el carrito en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Mostrar el carrito actualizado y el producto agregado
    mostrarCarrito();
}



// Función para actualizar la cantidad vendida de un producto en el inventario
function actualizarCantidadVendida(codigo, cantidadVendida) {
    const producto = productos.find(p => p.codigo === codigo);
    if (producto) {
        producto.cantidadVendida += cantidadVendida;
        localStorage.setItem("productos", JSON.stringify(productos)); // Guardar los cambios en el inventario
        mostrarInventario(); // Volver a mostrar el inventario con la cantidad actualizada
    }
}



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




function generarReporteProcesadosPDF() {
    const { jsPDF } = window.jspdf;

    let numeroBoleta = localStorage.getItem('numeroBoleta');
    if (!numeroBoleta) {
        numeroBoleta = 1;
    } else {
        numeroBoleta = parseInt(numeroBoleta) + 1;
    }
    localStorage.setItem('numeroBoleta', numeroBoleta);

    const doc = new jsPDF({
        unit: 'mm',
        format: [57.5, 210] // Tamaño de página ajustado para la impresora POS-58
    });

    // Agregar la imagen directamente al PDF
    const imagenPath = 'MisDeli.png'; 
    const imgWidth = 55;  // Aumentamos el tamaño de la imagen
    const imgHeight = 55;
    const xPos = (57.5 - imgWidth) / 2;
    const yPos = -10;

    doc.addImage(imagenPath, 'PNG', xPos, yPos, imgWidth, imgHeight);

    const margenSuperior = 25;  // Aumentamos el margen superior para bajar el contenido después de la imagen
    const margenIzq = 1;  // Reducimos el margen izquierdo para aprovechar mejor el espacio
    const margenDerecho = 56.5;  // Ajustamos el margen derecho

    // Usamos la misma fuente para todo
    doc.setFont('helvetica', 'bold'); // Establecemos la fuente a 'helvetica' en negrita
    doc.setFontSize(8); // Aumentamos el tamaño de fuente

    // Dirección encima del título "BOLETA DE VENTA"
    const direccion = 'AV SANTA ANA 212, COTAHUASI';  // Dirección de la empresa
    doc.text(direccion, 28.75, margenSuperior + 6, null, null, 'center');  // Dirección centrada

    // Número de teléfono debajo de la dirección
    const telefono = 'TELF: 950766205';  // Número de teléfono de la empresa
    doc.text(telefono, 28.75, margenSuperior + 10, null, null, 'center');  // Teléfono centrado

    // Título en mayúsculas
    doc.text('BOLETA DE VENTA', 28.75, margenSuperior + 14, null, null, 'center'); // Título

    // Fecha y hora en mayúsculas
    const fecha = new Date().toLocaleDateString();
    const hora = new Date().toLocaleTimeString();
    const fechaHora = `FECHA: ${fecha.toUpperCase()}      HORA: ${hora.toUpperCase()}`; // Añadí espacios adicionales entre la fecha y la hora

    doc.setFont('helvetica', 'normal'); // Fuente normal para el resto del contenido
    // Imprimir fecha y hora en una sola línea con más espacio entre ellas
    doc.text(fechaHora, 28.75, margenSuperior + 18, null, null, 'center');

    doc.setLineWidth(0.1);
    doc.line(margenIzq, margenSuperior + 20, margenDerecho, margenSuperior + 20);

    // Encabezado de la tabla de productos en negrita
    doc.setFontSize(6); // Aumentamos el tamaño de fuente del encabezado
    doc.setFont('helvetica', 'bold'); // Solo negrita para los subtítulos
    const col2 = 1;
    const col3 = 18.5;
    const col4 = 34;
    const col5 = 44;

    // Subtítulos en negrita
    doc.text('DESCRIPCION', col2, margenSuperior + 23);
    doc.text('PRECIO UNI.', col3, margenSuperior + 23);
    doc.text('CANT', col4, margenSuperior + 23);
    doc.text('SUBTOTAL', col5, margenSuperior + 23);
    doc.line(margenIzq, margenSuperior + 24, margenDerecho, margenSuperior + 24);

    let y = margenSuperior + 27;
    const maxY = 190;

    // Restante de productos en fuente normal
    doc.setFont('helvetica', 'normal'); // Fuente normal para los productos

    carrito.forEach(producto => {
        const subtotal = (producto.precio * producto.cantidad).toFixed(2);

        // Convertir el nombre del producto a mayúsculas y ajustarlo con splitTextToSize
        const nombreProducto = doc.splitTextToSize(producto.nombre.toUpperCase(), col3 - col2);

        // Imprimir el nombre del producto en mayúsculas
        nombreProducto.forEach((linea, index) => {
            doc.text(linea, col2, y + index * 2);
        });

        doc.text(`S/${producto.precio.toFixed(2)}`, col3, y);
        doc.text(`${producto.cantidad}`, col4, y);
        doc.text(`S/${subtotal}`, col5, y);

        y += nombreProducto.length * 2;
        y += 1;

        if (y > maxY) {
            doc.addPage();
            y = margenSuperior + 10;
        }
    });

    doc.line(margenIzq, y, margenDerecho, y);
    y += 2;

    // TOTAL en negrita
    doc.setFont('helvetica', 'bold'); // Cambiar a negrita para el total
    const total = carrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0).toFixed(2);
    const totalTexto = `S/${total}`;

    if (y + 6 > 200) {
        doc.addPage();
        y = 10;
    }

    doc.text('TOTAL:', col4, y);
    doc.text(totalTexto, 55 - doc.getTextWidth(totalTexto), y);

    doc.line(margenIzq, y + 1, margenDerecho, y + 1);

    y += 3;

    // Volver a fuente normal para el vuelto
    doc.setFont('helvetica', 'normal'); // Cambiar a normal para el vuelto

    const montoCliente = parseFloat(montoClienteInput.value) || 0;
    let vuelto = (montoCliente - total).toFixed(2);

    if (parseFloat(vuelto) < 0) {
        vuelto = '0.00';
    }

    const vueltoTexto = `S/${vuelto}`;

    if (y + 6 > 200) {
        doc.addPage();
        y = 10;
    }

    doc.text('VUELTO:', col4, y);
    doc.text(vueltoTexto, 55 - doc.getTextWidth(vueltoTexto), y);

    doc.line(margenIzq, y + 1, margenDerecho, y + 1);

    doc.save('boleta_de_venta.pdf');
}

// Event listener para el botón "Generar Reporte PDF de productos procesados"
document.getElementById('generar-reporte').addEventListener('click', generarReporteProcesadosPDF);


















