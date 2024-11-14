import azure.functions as func
import logging
import json
import psycopg2
import os
from Controllers.connection import getConnection


bpSuministros = func.Blueprint() 

#Recibe id_cantidad_sangrado y retorna solo esa columna o no recibe nada y retorna todas
@bpSuministros.route(route="getSuministros")
def getSuministros(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function getSuministros processed a request.')
    cursor = getConnection()[0]
    message = req.get_json()
    
    if not (message.get('id_suministro') is None):
        print("value is present for given JSON key")
        cursor.execute("SELECT * from public.suministros WHERE id_suministro = %s", [message["id_suministro"]])
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)
    else:
        print("value is not present for given JSON key")
        cursor.execute("SELECT * from public.suministros")
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)

    return func.HttpResponse(cosa)


@bpSuministros.route(route="createSuministros")
def createSuministros(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed createSuministros request.')
    cursor = getConnection()[0]
    connection = getConnection()[1]
    
    message = req.get_json()
    
    if not ((message.get('nombre_suministro') is None) or (message.get('id_categoria_suministro') is None) or (message.get('id_tipo_suministro') is None) or 
            (message.get('id_unidad_medida') is None) or (message.get('cantidad_disponible') is None) or (message.get('stock_minimo') is None) or
            (message.get('fecha_ultima_actualizacion') is None) or (message.get('nota_suministro') is None)):
        print("value is present for given JSON key")
        try:
            query= ("INSERT INTO suministros (nombre_suministro, id_categoria_suministro, id_tipo_suministro, id_unidad_medida, cantidad_disponible, stock_minimo, fecha_ultima_actualizacion, nota_suministro) VALUES ( %s, %s, %s, %s, %s, %s, %s, %s)")
            cursor.execute(query, [message["nombre_suministro"], message["id_categoria_suministro"], message["id_tipo_suministro"], message["id_unidad_medida"], message["cantidad_disponible"], message["stock_minimo"], message["fecha_ultima_actualizacion"], message["nota_suministro"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se agregó')
        except Exception as e:
            print(e)
            return func.HttpResponse('no se agregó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")
        return func.HttpResponse('no se agregó, faltaron parámetros')
    

@bpSuministros.route(route="updateSuministros")
def updateSuministros(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed updateSuministros request.')
    cursor = getConnection()[0]
    connection = getConnection()[1]
    
    message = req.get_json()
    
    if not ((message.get('nombre_suministro') is None) or (message.get('id_categoria_suministro') is None) or (message.get('id_tipo_suministro') is None) or 
            (message.get('id_unidad_medida') is None) or (message.get('cantidad_disponible') is None) or (message.get('stock_minimo') is None) or
            (message.get('fecha_ultima_actualizacion') is None) or (message.get('nota_suministro') is None)or (message.get('id_suministro') is None)):
        print("value is present for given JSON key")
        try:
            query= ("UPDATE suministros SET nombre_suministro = %s,  id_categoria_suministro = %s, id_tipo_suministro = %s, id_unidad_medida = %s, cantidad_disponible = %s, stock_minimo = %s, fecha_ultima_actualizacion = %s, nota_suministro = %s WHERE id_suministro = %s")
            cursor.execute(query, [message["nombre_suministro"], message["id_categoria_suministro"], message["id_tipo_suministro"], message["id_unidad_medida"], message["cantidad_disponible"], message["stock_minimo"], message["fecha_ultima_actualizacion"], message["nota_suministro"], message["id_suministro"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se agregó')
        except Exception as e:
            print(e)
            return func.HttpResponse('no se agregó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")
        return func.HttpResponse('no se agregó, faltaron parámetros')
    
@bpSuministros.route(route="deleteSuministros")
def deleteSuministros(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed deleteSuministros request.')
    cursor = getConnection()[0]
    connection = getConnection()[1]
    
    message = req.get_json()
    
    if not (message.get('id_suministro') is None):
        print("value is present for given JSON key")
        try:
            query= ("DELETE FROM suministros WHERE id_suministro = %s")
            cursor.execute(query, [message["id_suministro"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se agregó')
        except Exception as e:
            print(e)
            return func.HttpResponse('no se agregó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")
        return func.HttpResponse('no se agregó, faltaron parámetros')