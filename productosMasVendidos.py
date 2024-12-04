import pyodbc

# Parámetros de conexión
server = 'LSCANIOM21'  # Nombre de tu servidor
database = 'Supermercado'  # Nombre de tu base de datos

# Conexión usando autenticación de Windows
conn = pyodbc.connect(
    f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};Trusted_Connection=yes;'
)

# Crear un cursor para ejecutar las consultas
cursor = conn.cursor()

# Consulta para obtener los 10 productos más vendidos
query = '''
SELECT TOP 5
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

# Obtener los resultados
productos = cursor.fetchall()

# Mostrar los resultados en el orden solicitado
print("Nombre del Producto | Descripción | Categoría | Total Vendidos")
print("-" * 70)
for producto in productos:
    print(f"{producto.NombreProducto} | {producto.DescripcionProducto} | {producto.Categoria} | {producto.TotalVendidos}")

# Cerrar la conexión
conn.close()
