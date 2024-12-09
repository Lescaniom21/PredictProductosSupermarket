document.getElementById('prediction-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Formulario enviado correctamente');
});

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const idClienteInput = document.getElementById("idCliente");

    // Manejar entrada del cliente con debounce
    const handleInput = debounce(async (event) => {
        const idCliente = event.target.value.trim();
        console.log("Input value after debounce:", idCliente);

        // Validar si el ID es un entero
        if (!/^\d+$/.test(idCliente)) {
            alert("El ID debe ser un número entero.");
            limpiarCampos();
            limpiarTabla();
            return;
        }

        try {
            // Solicitar datos del cliente a la API
            const response = await fetch(`/api/clients/${idCliente}`);
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('data', JSON.stringify(data));

                // Rellenar campos con los datos recibidos
                document.getElementById("nombreCliente").value = data.Nombre;
                document.getElementById("apellidoCliente").value = data.Apellido;
                document.getElementById("sexo").value = data.Sexo;

                // Cargar las recomendaciones de productos para el cliente
                cargarProductosRecomendados(idCliente);
            } else if (response.status === 404) {
                alert("El ID ingresado no se encuentra en la base de datos.");
                limpiarCampos();
                limpiarTabla();
            } else {
                throw new Error("Error al consultar la base de datos.");
            }
        } catch (error) {
            console.error(error);
            alert("Ocurrió un error al realizar la consulta.");
            limpiarCampos();
            limpiarTabla();
        }
    }, 300); // Ajustar el delay si es necesario

    // Escuchar evento de entrada y manejarlo
    idClienteInput.addEventListener('input', handleInput);

    // Manejar evento blur si es necesario
    idClienteInput.addEventListener("blur", async () => {
        const idCliente = idClienteInput.value.trim();
        // Se pueden agregar validaciones o acciones adicionales aquí si es necesario
    });

    // Función para limpiar los campos
    function limpiarCampos() {
        document.getElementById("nombreCliente").value = "";
        document.getElementById("apellidoCliente").value = "";
        document.getElementById("sexo").value = "";
    }

    // Función para limpiar la tabla de productos
    function limpiarTabla() {
        const tablaProductos = document.getElementById('tabla-productos');
        tablaProductos.innerHTML = '';
    }

    // Función para cargar productos recomendados
    async function cargarProductosRecomendados(clienteId) {
        try {
            const response = await fetch(`/api/predictions/${clienteId}`);
            if (!response.ok) {
                throw new Error('Error al obtener las predicciones');
            }

            const productos = await response.json();

            // Seleccionar el cuerpo de la tabla
            const tablaProductos = document.getElementById('tabla-productos');
            tablaProductos.innerHTML = '';

            // Insertar las filas de los productos
            productos.forEach(producto => {
                const fila = `
                    <tr>
                        <td>${producto.ID}</td>
                        <td>${producto.NombreProducto}</td>
                        <td>${producto.DescripcionProducto}</td>
                        <td>${producto.Categoria}</td>
                    </tr>
                `;
                tablaProductos.innerHTML += fila;
            });
        } catch (error) {
            console.error('Error:', error);
            alert("Ocurrió un error al cargar los productos recomendados.");
            limpiarTabla();
        }
    }

    async function cargar5Productos(clienteId) {
        try {
            const response = await fetch(`/api/predictions/${clienteId}`);
            if (!response.ok) {
                throw new Error('Error al obtener las predicciones');
            }

            const productos = await response.json();

            // Seleccionar el cuerpo de la tabla
            const tablaProductos = document.getElementById('productos-five');
            tablaProductos.innerHTML = '';

            // Insertar las filas de los productos
            productos.forEach(producto => {
                const fila = `
                    <tr>
                        <td>${producto.ID}</td>
                        <td>${producto.NombreProducto}</td>
                        <td>${producto.DescripcionProducto}</td>
                        <td>${producto.Categoria}</td>
                    </tr>
                `;
                tablaProductos.innerHTML += fila;
            });
        } catch (error) {
            console.error('Error:', error);
            alert("Ocurrió un error al cargar los productos recomendados.");
            limpiarTabla();
        }
    }
});
