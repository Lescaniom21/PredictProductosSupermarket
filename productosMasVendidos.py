from flask import Flask, render_template
import pyodbc
import os

# Crear la app Flask, especificando la carpeta actual como la carpeta de plantillas
app = Flask(__name__,
            template_folder=os.getcwd(),  # Carpeta donde están las plantillas HTML
            static_folder=os.getcwd())    # Carpeta donde están los archivos estáticos (CSS, JS, IMG)

# Parámetros de conexión a la base de datos
server = 'LSCANIOM21'
database = 'Supermercado'

@app.route('/')  # Ruta principal que servirá el archivo index.html
def productos_mas_vendidos():
    # Conectar a la base de datos
    conn = pyodbc.connect(
        f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};Trusted_Connection=yes;'
    )
    cursor = conn.cursor()

    # Consulta SQL para obtener los 10 productos más vendidos
    query = '''
    SELECT TOP 10
        p.Nombre AS NombreProducto,
        p.Descripcion AS DescripcionProducto,
        cp.Nombre AS Categoria,
        SUM(hf.Cantidad) AS TotalVendidos
    FROM HistorialFactura hf
    JOIN Producto p ON hf.ProductoID = p.ProductoID
    JOIN CategoriaProducto cp ON p.CategoriaID = cp.CategoriaID
    GROUP BY p.Nombre, p.Descripcion, cp.Nombre
    ORDER BY TotalVendidos DESC;
    '''

    # Ejecutar la consulta
    cursor.execute(query)
    productos = cursor.fetchall()

    # Cerrar la conexión
    conn.close()

    # Pasar los datos a la plantilla (index.html)
    return render_template('index.html', productos=productos)

if __name__ == '__main__':
    app.run(debug=True)
