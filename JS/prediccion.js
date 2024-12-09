
 function drawBase64Onimg(base64String, imgId) {
    console.log("Drawing Base64 image on canvas...");
    // If a string ID is provided, fetch the canvas element
    let imgg = document.getElementById(imgId)

    // Set the image source to the Base64 string
    imgg.src = "data:image/png;base64, "+base64String;
}


document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("prediction-form");
    const idClienteInput = document.getElementById("idCliente");
    const tablaProductos = document.getElementById("tabla-productos");
    const recallElement = document.getElementById("recall-prediccion"); // Elemento para mostrar el recall

    // Debounce para evitar múltiples llamadas
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Escucha el evento submit del formulario
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evita el envío tradicional del form

        const idCliente = idClienteInput.value.trim();

        // Validar que el ID sea un número entero
        if (!/^\d+$/.test(idCliente)) {
            alert("El ID debe ser un número entero.");
            limpiarCampos();
            limpiarTabla();
            limpiarRecall(); // Limpia el valor de recall si hay error
            return;
        }

        try {
            // Enviar solicitud al endpoint de predicciones
            const response = await fetch(`/api/predictions/${idCliente}`);
            if (!response.ok) {
                alert("Error al obtener las predicciones.");
                limpiarRecall(); // Limpia el valor de recall si hay error
                return;
            }

            const predictions = await response.json();
            drawBase64Onimg(predictions.grafico_barras, 'graficoBarras');
            drawBase64Onimg(predictions.grafico_torta, 'graficoTorta');
            // Limpiar la tabla antes de insertar nuevas filas
            tablaProductos.innerHTML = '';

            // Insertar las filas de las predicciones
            predictions.productos_recomendados.forEach((pred) => {
                const row = document.createElement("tr");
                const productCell = document.createElement("td");
                const relevanciaCell = document.createElement("td");

                productCell.textContent = pred[0]; // Nombre del producto
                relevanciaCell.textContent = (pred[1] / 10).toFixed(2); // Relevancia con formato

                row.appendChild(productCell);
                row.appendChild(relevanciaCell);
                tablaProductos.appendChild(row);
            });

            // Mostrar el valor de recall en el elemento correspondiente
            const recallValue = parseFloat(predictions.recall).toFixed(4); // Formatear a 4 decimales
            recallElement.textContent = `Recall de la predicción: ${recallValue}`;
        } catch (error) {
            console.error("Error:", error);
            alert("Ocurrió un error al procesar la solicitud.");
            limpiarRecall(); // Limpia el valor de recall en caso de error
        }
    });

    // Función para limpiar los campos (si es necesario)
    function limpiarCampos() {
        // Si hay más campos del formulario, puedes incluirlos aquí
        // document.getElementById("nombreCliente").value = "";
        // document.getElementById("apellidoCliente").value = "";
        // document.getElementById("sexo").value = "";
    }

    // Función para limpiar la tabla de productos
    function limpiarTabla() {
        tablaProductos.innerHTML = '';
    }

    // Función para limpiar el valor de recall
    function limpiarRecall() {
        recallElement.textContent = "Recall de la predicción: ";
    }
});



// script.js

document.addEventListener("DOMContentLoaded", () => {
    // Elementos del formulario y campos de cliente
    const form = document.getElementById("prediction-form");
    const idClienteInput = document.getElementById("idCliente");
    const nombreClienteInput = document.getElementById("nombreCliente");
    const apellidoClienteInput = document.getElementById("apellidoCliente");
    const sexoClienteInput = document.getElementById("sexo");
    
    // Elementos para mostrar predicciones
    const tablaProductos = document.getElementById("tabla-productos");
    const recallElement = document.getElementById("recall-prediccion");

    /**
     * Función de debounce para limitar la frecuencia de ejecución de una función.
     * @param {Function} func - Función a ejecutar.
     * @param {number} delay - Retardo en milisegundos.
     * @returns {Function} - Función debounced.
     */
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    /**
     * Función para limpiar los campos de cliente.
     */
    function limpiarCampos() {
        nombreClienteInput.value = "";
        apellidoClienteInput.value = "";
        sexoClienteInput.value = "";
    }

    /**
     * Función para limpiar la tabla de productos.
     */
    function limpiarTabla() {
        tablaProductos.innerHTML = '';
    }

    /**
     * Función para limpiar el valor de recall.
     */
    function limpiarRecall() {
        recallElement.textContent = "Recall de la predicción: ";
    }

  


    /**
     * Función para cargar y mostrar los datos del cliente.
     * @param {string} idCliente - ID del cliente.
     */
    async function cargarDatosCliente(idCliente) {
        try {
            const response = await fetch(`/api/clients/${idCliente}`);
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('data', JSON.stringify(data));

                // Rellenar campos con los datos recibidos
                nombreClienteInput.value = data.Nombre;
                apellidoClienteInput.value = data.Apellido;
                sexoClienteInput.value = data.Sexo;

                // Opcional: Puedes cargar las recomendaciones automáticamente aquí si lo deseas
                // cargarPredicciones(idCliente);
                
            } else if (response.status === 404) {
                alert("El ID ingresado no se encuentra en la base de datos.");
                limpiarCampos();
                limpiarTabla();
                limpiarRecall();
            } else {
                throw new Error("Error al consultar la base de datos.");
            }
        } catch (error) {
            console.error(error);
            alert("Ocurrió un error al realizar la consulta.");
            limpiarCampos();
            limpiarTabla();
            limpiarRecall();
        }
    }

    /**
     * Función para cargar y mostrar las predicciones de productos.
     * @param {string} idCliente - ID del cliente.
     */
    async function cargarPredicciones(idCliente) {
        try {
            const response = await fetch(`/api/predictions/${idCliente}`);
            if (!response.ok) {
                throw new Error('Error al obtener las predicciones.');
            }

            const predictions = await response.json();
           

            // Verificar si la respuesta contiene los campos esperados
            if (!predictions.productos_recomendados || typeof predictions.recall === 'undefined') {
                throw new Error('Respuesta de API inesperada.');
            }

            // Limpiar la tabla y recall antes de insertar nuevas filas
            limpiarTabla();
            limpiarRecall();

            // Insertar las filas de las predicciones en la tabla
            predictions.productos_recomendados.forEach((producto) => {
                const row = document.createElement("tr");

                // Crear y asignar las celdas de la fila
                const nombreCell = document.createElement("td");
                const relevanciaCell = document.createElement("td");

                nombreCell.textContent = producto.NombreProducto;
                relevanciaCell.textContent = (producto.Relevancia / 10).toFixed(2); // Formatear relevancia

                row.appendChild(nombreCell);
                row.appendChild(relevanciaCell);
                tablaProductos.appendChild(row);
            });

            // Mostrar el valor de recall
            const recallValue = parseFloat(predictions.recall).toFixed(4);
            recallElement.textContent = `Recall de la predicción: ${recallValue}`;
        } catch (error) {
            console.error("Error:", error);
            alert("Ocurrió un error al cargar las predicciones.");
            limpiarTabla();
            limpiarRecall();
        }
    }

    /**
     * Evento de input con debounce para manejar la entrada del ID del cliente.
     */
    const handleInput = debounce(async (event) => {
        const idCliente = event.target.value.trim();
        console.log("Input value after debounce:", idCliente);

        // Validar si el ID es un entero
        if (!/^\d+$/.test(idCliente)) {
            alert("El ID debe ser un número entero.");
            limpiarCampos();
            limpiarTabla();
            limpiarRecall();
            return;
        }

        // Cargar los datos del cliente
        await cargarDatosCliente(idCliente);
    }, 300); // Ajustar el delay si es necesario

    // Escuchar evento de entrada y manejarlo
    idClienteInput.addEventListener('input', handleInput);

    /**
     * Evento de submit del formulario para manejar las predicciones.
     */
    form.addEventListener("submit2", async (event) => {
        event.preventDefault(); // Evita el envío tradicional del formulario

        const idCliente = idClienteInput.value.trim();

        // Validar que el ID sea un número entero
        if (!/^\d+$/.test(idCliente)) {
            alert("El ID debe ser un número entero.");
            limpiarCampos();
            limpiarTabla();
            limpiarRecall();
            return;
        }

        // Cargar las predicciones de productos
        await cargarPredicciones(idCliente);
    });

});

