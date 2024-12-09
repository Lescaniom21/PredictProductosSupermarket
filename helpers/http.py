
from flask import Response

def response_builder(data, status_code):
    return Response(data, mimetype='application/json', status=status_code)
