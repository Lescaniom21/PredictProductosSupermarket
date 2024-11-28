from flask import Flask, send_file
import matplotlib.pyplot as plt
import io

app = Flask(__name__)

@app.route('/grafico')
def generar_grafico():
    # Datos
    dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    ventas = [55, 89, 180, 160, 115, 180, 205]

    # Crear el gráfico
    plt.figure(figsize=(10, 6))
    plt.plot(dias, ventas, marker='o', linestyle='-', color='blue', label='Ventas')
    plt.title('Ventas Semanales', fontsize=16)
    plt.xlabel('Días de la Semana', fontsize=12)
    plt.ylabel('Cantidad de Ventas', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.legend()
    plt.tight_layout()

    # Guardar el gráfico en un objeto BytesIO
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()

    # Enviar el archivo como respuesta
    return send_file(img, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
