// Función para obtener los datos de la API y crear el gráfico
async function cargarGrafico() {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/productos_mas_vendidos'); // URL de tu API
      const data = await response.json();
  
      // Función para truncar los nombres de los productos
      const truncarNombre = (nombre) => {
        return nombre.length > 6 ? nombre.slice(0, 6) + '...' : nombre;
      };
  
      // Extraer nombres truncados y cantidades vendidas
      const nombres = data.map(producto => truncarNombre(producto.NombreProducto));
      const totalVendidos = data.map(producto => producto.TotalVendidos);
  
      // Crear el gráfico con Chart.js
      const ctx = document.getElementById('productosChart').getContext('2d');
      new Chart(ctx, {
        type: 'line', // Tipo de gráfico
        data: {
          labels: nombres, // Nombres de los productos (truncados)
          datasets: [{
            label: 'Cantidad Vendida',
            data: totalVendidos, // Cantidades vendidas
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0.4, // Suaviza las líneas del gráfico
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Productos Más Vendidos' }
          },
          scales: {
            x: { title: { display: true, text: 'Productos' } },
            y: { title: { display: true, text: 'Cantidad Vendida' }, beginAtZero: true }
          }
        }
      });
    } catch (error) {
      console.error('Error al cargar el gráfico:', error);
    }
  }
  
  // Llamar a la función para cargar el gráfico
  document.addEventListener("DOMContentLoaded", function() {
    cargarGrafico();
  });
  