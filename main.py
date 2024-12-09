from flask import Flask, render_template, jsonify
from helpers.http import response_builder
from flask_cors import CORS
from prection_class import predictor

import os
import pyodbc

app = Flask(__name__,
            template_folder=os.getcwd(),  # Carpeta donde están las plantillas HTML
            static_folder=os.getcwd())    # Carpeta donde están los archivos estáticos (CSS, JS, IMG)

CORS(app, resources={r"/*": {"origins": "*"}})  # Habilitar CORS en la app

# Parámetros de conexión a la base de datos
server = 'LSCANIOM21'
database = 'Supermarket'

conn = pyodbc.connect(
        f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};Trusted_Connection=yes;'
    )

predict = predictor(conn)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/productos_mas_vendidos', methods=['GET'])
def api_productos_mas_vendidos():
    cursor = conn.cursor()
    query = '''
    SELECT TOP 10
        p.ProductoID AS ID,
        p.Nombre AS NombreProducto,
        p.Descripcion AS DescripcionProducto,
        cp.Nombre AS Categoria,
        SUM(hf.Cantidad) AS TotalVendidos
    FROM HistorialFactura hf
    JOIN Producto p ON hf.ProductoID = p.ProductoID
    JOIN CategoriaProducto cp ON p.CategoriaID = cp.CategoriaID
    GROUP BY p.ProductoID, p.Nombre, p.Descripcion, cp.Nombre
    ORDER BY TotalVendidos DESC;
    '''
    cursor.execute(query)
    productos = cursor.fetchall()
    resultado = [
        {
            "ID": prod[0],
            "NombreProducto": prod[1],
            "DescripcionProducto": prod[2],
            "Categoria": prod[3],
            "TotalVendidos": prod[4]
        }
        for prod in productos
    ]
    return jsonify(resultado)

@app.route('/api/clients/<int:id>', methods=['GET'])
def get_client(id):
    cursor = conn.cursor()
    query = f'''SELECT * FROM Cliente WHERE ClienteID = {id}'''
    cursor.execute(query)
    cliente = cursor.fetchone()

    if cliente is None:
        return response_builder("El cliente no ha sido encontrado.", 404)

    resultado = {
        "ID": cliente[0],
        "Nombre": cliente[1],
        "Apellido": cliente[2],
        "Sexo": cliente[3],
    }
    return jsonify(resultado)

@app.route('/api/predictions/<int:id>', methods=['GET'])
def get_predictions(id):
    coocurrencia = predict.construir_matriz_coocurrencia()
    recomendaciones = predict.predecir_productos(id, coocurrencia)
    recall = predict.calcular_recall(coocurrencia, id)

    # Generar gráficos en base64
    grafico_barras = predict.graficar_recomendaciones_barras_base64(recomendaciones, id)
    grafico_torta = predict.graficar_recomendaciones_torta_base64(recomendaciones, id)

    # Construir la respuesta
    results = {
        "productos_recomendados": recomendaciones,
        "recall": recall,
        "grafico_barras": grafico_barras,
        "grafico_torta": grafico_torta

    }
    return jsonify(results)

if __name__ == '__main__':
    app.run(port=5001, debug=True)
