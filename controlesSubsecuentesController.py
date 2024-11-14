import azure.functions as func
import logging
import json
import psycopg2
import os
from Controllers.connection import getConnection


bpControlesSubsecuentes = func.Blueprint() 

#Recibe id_control_subsecuente y retorna solo esa columna o no recibe nada y retorna todas
@bpControlesSubsecuentes.route(route="getControlesSubsecuentes")
def getControlesSubsecuentes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function getControlesSubsecuentes processed a request.')
    cursor = getConnection()[0]
    message = req.get_json()
    
    if not (message.get('id_control_subsecuente') is None):
        print("value is present for given JSON key")
        cursor.execute("SELECT * from public.controles_subsecuentes WHERE id_control_subsecuente = %s", [message["id_control_subsecuente"]])
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)
    else:
        print("value is not present for given JSON key")
        cursor.execute("SELECT * from public.controles_subsecuentes")
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)

    return func.HttpResponse(cosa)

@bpControlesSubsecuentes.route(route="createControlesSubsecuentes")
def createControlesSubsecuentes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed createControlesSubsecuentes request.')
    cursor = getConnection()[0]
    connection = getConnection()[1]
    
    message = req.get_json()
    
    if not ((message.get('id_paciente') is None) or 
            (message.get('id_servicio') is None) or (message.get('fecha_hora_control') is None) or 
            (message.get('motivo_consulta_control') is None) or (message.get('observaciones_control') is None) or 
            (message.get('monto_control') is None) or 
            (message.get('id_forma_pago') is None) or (message.get('id_estado_cita') is None) or 
            (message.get('fecha_creacion_control') is None)):
        print("value is present for given JSON key")
        try:
            query= ("INSERT INTO controles_subsecuentes (id_paciente, id_servicio, fecha_hora_control, motivo_consulta_control,observaciones_control ,monto_control ,id_forma_pago, id_estado_cita, fecha_creacion_control) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)")
            cursor.execute(query, [message["id_paciente"], message["id_servicio"], message["fecha_hora_control"], message["motivo_consulta_control"], message["observaciones_control"], message["monto_control"], message["id_forma_pago"], message["id_estado_cita"], message["fecha_creacion_control"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se agregó')
        except Exception as e:
            print(e)
            return func.HttpResponse('no se agregó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")
        return func.HttpResponse('no se agregó, faltaron parámetros')
    

@bpControlesSubsecuentes.route(route="updateControlesSubsecuentes")
def updateControlesSubsecuentes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed updateControlesSubsecuentes request.')
    try: 
        cursor = getConnection()[0]
        connection = getConnection()[1]
    except Exception as e:
        print(e)
        return func.HttpResponse('no se modificó, hubo un error en la conección con la base')
        
    message = req.get_json() 
    
    if not ((message.get('id_servicio') is None) or (message.get('motivo_consulta_control') is None) or (message.get('observaciones_control') is None) or (message.get('indicaciones_control') is None) or 
            (message.get('monto_control') is None) or (message.get('id_forma_pago') is None) or (message.get('id_estado_cita') is None) or (message.get('id_control_subsecuente') is None)):
        print("value is present for given JSON key")
        try:
            query= ("UPDATE controles_subsecuentes SET motivo_consulta_control = %s, observaciones_control = %s, indicaciones_control = %s, monto_control = %s, id_forma_pago = %s, id_estado_cita = %s, id_servicio = %s WHERE id_control_subsecuente = %s")
            cursor.execute(query, [message["motivo_consulta_control"], message["observaciones_control"], message["indicaciones_control"], message["monto_control"], message["id_forma_pago"], message["id_estado_cita"], message["id_servicio"], message["id_control_subsecuente"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se modificó')
        except Exception as e:
            print(e)
            return func.HttpResponse('no se modificó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")
        return func.HttpResponse('no se modificó, faltaron parámetros')
    

@bpControlesSubsecuentes.route(route="deleteControlesSubsecuentes")
def deleteControlesSubsecuentes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed deleteControlesSubsecuentes request.')
    try: 
        cursor = getConnection()[0]
        connection = getConnection()[1]
    except Exception as e:
        print(e)
        return func.HttpResponse('no se eliminó, hubo un error en la conección con la base')
        
    message = req.get_json()
    
    if not ((message.get('id_control_subsecuente') is None)):
        print("value is present for given JSON key")
        try:
            query= ("DELETE FROM controles_subsecuentes WHERE id_control_subsecuente = %s")
            cursor.execute(query, [message["id_control_subsecuente"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se eliminó')
        except Exception as e:
            print(e)
            return func.HttpResponse('no se eliminó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")
        return func.HttpResponse('no se eliminó, faltaron parámetros')