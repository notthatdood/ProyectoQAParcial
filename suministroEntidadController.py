import azure.functions as func
import logging
import json
import psycopg2
import os
from Controllers.connection import getConnection


bpSuministroEntidad = func.Blueprint() 

#Recibe id_cantidad_sangrado y retorna solo esa columna o no recibe nada y retorna todas
@bpSuministroEntidad.route(route="getSuministroEntidad")
def getSuministroEntidad(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function getSuministroEntidad processed a request.')
    cursor = getConnection()[0]
    message = req.get_json()
    
    if not (message.get('id_suministro_entidad') is None):
        print("value is present for given JSON key")
        cursor.execute("SELECT * from public.suministro_entidad WHERE id_suministro_entidad = %s", [message["id_suministro_entidad"]])
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)
    else:
        print("value is not present for given JSON key")
        cursor.execute("SELECT * from public.suministro_entidad")
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)

    return func.HttpResponse(cosa)