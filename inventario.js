const formulario = document.getElementById("formulario-productos");
const inventarioLista = document.getElementById("inventario-lista");

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let productoEditando = null; // Variable para almacenar el producto que estamos editando

// Referencia al campo de búsqueda
const busquedaInput = document.getElementById("busqueda");

// Función para filtrar los productos según la búsqueda
busquedaInput.addEventListener("input", function(event) {
    const query = event.target.value.toLowerCase();  // Convertir la búsqueda a minúsculas
    mostrarInventario(query);  // Llamamos a la función que muestra los productos filtrados
});

// Modificar la función de mostrarInventario para aceptar un parámetro de búsqueda
function mostrarInventario(query = "") {
    inventarioLista.innerHTML = "";
    productos
        .filter(producto => {
            // Filtramos productos que coincidan con la búsqueda (por nombre o código)
            return producto.nombre.toLowerCase().includes(query) || producto.codigo.toLowerCase().includes(query);
        })
        .forEach((producto, index) => {
            const cantidadRestante = producto.cantidad - producto.cantidadVendida;
            const cantidadRestanteClass = cantidadRestante <= 3 ? "baja" : "";

            const productoElemento = document.createElement("tr");
            productoElemento.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>S/${producto.precio.toFixed(2)}</td>
                <td>${producto.cantidad}</td>
                <td class="${cantidadRestanteClass}">${cantidadRestante}</td>
                <td>
                    <div class="acciones">
                        <button class="editar-btn" onclick="editarProducto(${index})">Editar</button>
                        <button class="eliminar-btn" onclick="eliminarProducto(${index})">Eliminar</button>
                    </div>
                </td>
            `;
            inventarioLista.appendChild(productoElemento);
        });
}


// Función para manejar el formulario de agregar o editar productos
formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const codigo = document.getElementById("codigo").value;
    const nombre = document.getElementById("nombre").value;
    let precio = parseFloat(document.getElementById("precio").value); 
    const cantidad = parseInt(document.getElementById("cantidad").value);

    // Validar que el precio no sea negativo y que sea un número válido
    if (isNaN(precio) || precio < 0) {
        alert("Por favor ingresa un precio válido y positivo.");
        return;
    }

    // Validar que la cantidad no sea negativa
    if (cantidad < 0) {
        alert("La cantidad no puede ser negativa.");
        return;
    }

    if (codigo && nombre && !isNaN(precio) && precio >= 0 && cantidad >= 0) {
        if (productoEditando !== null) {
            // Si estamos editando un producto existente
            const producto = productos[productoEditando];

            // Solo actualizamos la cantidad si el valor es distinto al anterior
            if (producto.cantidad !== cantidad) {
                // Calculamos la cantidad restante (productos no vendidos)
                const cantidadRestante = producto.cantidad - producto.cantidadVendida;
                // Sumamos la cantidad restante con la nueva cantidad ingresada en el formulario
                producto.cantidad = cantidadRestante + cantidad; // Actualizamos la cantidad total
                producto.cantidadVendida = 0; // Reiniciamos la cantidad vendida ya que es una nueva cantidad
            }

            // Actualizamos el nombre, código y precio del producto
            producto.codigo = codigo;
            producto.nombre = nombre;
            producto.precio = precio;

        } else {
            // Si estamos agregando un producto nuevo
            productos.push({ 
                codigo, 
                nombre, 
                precio, 
                cantidad, 
                cantidadVendida: 0  
            });
        }

        // Guardar los cambios en el inventario en localStorage
        localStorage.setItem("productos", JSON.stringify(productos));
        mostrarInventario();
        formulario.reset(); // Limpiar formulario
        productoEditando = null; // Limpiar la variable de edición
    }
});

// Función para editar un producto
function editarProducto(index) {
    const producto = productos[index];
    document.getElementById("codigo").value = producto.codigo;
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("cantidad").value = producto.cantidad;
    productoEditando = index; // Guardar el índice del producto que estamos editando
}

// Función para eliminar un producto
function eliminarProducto(index) {
    productos.splice(index, 1);
    localStorage.setItem("productos", JSON.stringify(productos));
    mostrarInventario();
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

// Mostrar inventario al cargar la página
mostrarInventario();

// CSS para el color rojo cuando la cantidad restante es baja
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .baja {
            background-color: red;
            color: white;
        }
    </style>
`);




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
