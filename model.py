import pyodbc
import warnings
import pandas as pd
from collections import Counter
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")

connection = pyodbc.connect('DRIVER={SQL Server};SERVER=LSCANIOM21;DATABASE=Supermarket')

query = """
    SELECT 
        c.ClienteID,
        p.ProductoID,
        p.Nombre AS NombreProducto,
        f.FacturaID
    FROM 
        HistorialFactura h
    JOIN 
        Factura f ON h.FacturaID = f.FacturaID
    JOIN 
        Cliente c ON f.ClienteID = c.ClienteID
    JOIN 
        Producto p ON h.ProductoID = p.ProductoID
"""
data = pd.read_sql(query, connection)

def construir_matriz_coocurrencia(data):
    coocurrencia = {}
    facturas = data.groupby('FacturaID')['ProductoID'].apply(list)
    for productos in facturas:
        for producto in productos:
            if producto not in coocurrencia:
                coocurrencia[producto] = Counter()
            for otro_producto in productos:
                if producto != otro_producto:
                    coocurrencia[producto][otro_producto] += 1
    for producto, counter in coocurrencia.items():
        total = sum(counter.values())
        for otro_producto in counter:
            coocurrencia[producto][otro_producto] /= total
    return coocurrencia

def predecir_productos(cliente_id, data, coocurrencia, top_n=5):
    cliente_data = data[data['ClienteID'] == cliente_id]
    if cliente_data.empty:
        return f"No se encontraron datos para el cliente con ID {cliente_id}."
    
    productos_comprados = set(cliente_data['ProductoID'])
    recomendaciones = Counter()
    
    for producto in productos_comprados:
        if producto in coocurrencia:
            for otro_producto, peso in coocurrencia[producto].items():
                if otro_producto not in productos_comprados:
                    recomendaciones[otro_producto] += peso * len(cliente_data)
    
    recomendados = sorted(recomendaciones.items(), key=lambda x: x[1], reverse=True)[:top_n]
    nombres_recomendados = [
        (data[data['ProductoID'] == prod]['NombreProducto'].values[0], round(relevancia / 10, 2))
        for prod, relevancia in recomendados
    ]
    return nombres_recomendados

def graficar_recomendaciones_barras(recomendaciones, cliente_id):
    productos, relevancias = zip(*recomendaciones)
    plt.figure(figsize=(10, 6))
    plt.barh(productos, relevancias, color=plt.cm.Paired.colors)
    plt.xlabel('Puntuación de Recomendación')
    plt.ylabel('Producto')
    plt.title(f'Productos Recomendados para Cliente {cliente_id}')
    plt.tight_layout()
    plt.show()
    
def graficar_recomendaciones_torta(recomendaciones, cliente_id):
    productos, relevancias = zip(*recomendaciones)
    plt.figure(figsize=(8, 8))
    plt.pie(relevancias, labels=productos, autopct='%1.1f%%', startangle=140, colors=plt.cm.Paired.colors)
    plt.title(f'Distribución de relevancias para cliente {cliente_id}')
    plt.axis('equal')
    plt.show()
    
def calcular_recall(data, coocurrencia, cliente_id, top_n=5):
    cliente_data = data[data['ClienteID'] == cliente_id]
    if cliente_data.empty or len(cliente_data) < 4:  
        return "No es posible calcular recall debido a la falta de datos suficientes."
    
    productos_comprados = list(cliente_data['ProductoID'])
    entrenamiento = productos_comprados[:-3]
    prueba = productos_comprados[-3:]
    
    recomendaciones = Counter()
    for producto in entrenamiento:
        if producto in coocurrencia:
            for otro_producto, peso in coocurrencia[producto].items():
                if otro_producto not in entrenamiento:
                    recomendaciones[otro_producto] += peso
    
    predicciones = [
        prod for prod, _ in sorted(recomendaciones.items(), key=lambda x: x[1], reverse=True)[:top_n]
    ]
    
    aciertos = sum(1 for prod in prueba if prod in predicciones)
    recall = aciertos / len(prueba) if len(prueba) > 0 else 0
    
    if len(predicciones) == 0:
        return "Recall no es calculable debido a falta de predicciones."

    return f"{recall:.4f}"

coocurrencia = construir_matriz_coocurrencia(data)

while True:
    cliente_id = int(input("Ingrese el ID del cliente: "))
    productos_recomendados = predecir_productos(cliente_id, data, coocurrencia)
    
    if isinstance(productos_recomendados, list):
        print(f"Productos recomendados para el cliente {cliente_id}:")
        for producto, relevancia in productos_recomendados:
            print(f"- {producto} (Relevancia: {relevancia:.4f})")
        graficar_recomendaciones_barras(productos_recomendados, cliente_id)
        graficar_recomendaciones_torta(productos_recomendados, cliente_id)
        
        recall = calcular_recall(data, coocurrencia, cliente_id)
        print(f"Recall del modelo: {recall}")
    else:
        print(productos_recomendados)
    
    continuar = input("¿Desea ingresar otro ID de cliente? (s/n): ").strip().lower()
    if continuar != 's':
        print("Programa terminado.")
        break