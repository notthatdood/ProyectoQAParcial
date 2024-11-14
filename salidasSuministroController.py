import azure.functions as func
import logging
import json
import psycopg2
import os
from Controllers.connection import getConnection


bpSalidasSuministro = func.Blueprint() 

#Recibe id_cantidad_sangrado y retorna solo esa columna o no recibe nada y retorna todas
@bpSalidasSuministro.route(route="getSalidasSuministro")
def getSalidasSuministro(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function getSalidasSuministro processed a request.')
    cursor = getConnection()[0]
    message = req.get_json()
    
    if not (message.get('id_salida_suministro') is None):
        print("value is present for given JSON key")
        cursor.execute("SELECT * from public.salidas_suministro WHERE id_salida_suministro = %s", [message["id_salida_suministro"]])
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)
    else:
        print("value is not present for given JSON key")
        cursor.execute("SELECT * from public.salidas_suministro")
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)

    return func.HttpResponse(cosa)