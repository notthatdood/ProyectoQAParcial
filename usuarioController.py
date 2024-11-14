import azure.functions as func
import logging
import json
import psycopg2
import os
from Controllers.connection import getConnection

bpUsuarios = func.Blueprint() 

@bpUsuarios.route(route="getUsuarios")
def getUsuarios(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function getUsuarios processed a request.')
    cursor = getConnection()[0]
    message = req.get_json()
    
    if not (message.get('id_usuario') is None):
        print("value is present for given JSON key")
        cursor.execute("SELECT * from public.usuarios WHERE id_usuario = %s", [message["id_usuario"]])
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)
    elif not (message.get('correo_electronico_usuario') is None):
        print("value is present for given JSON key")
        cursor.execute("SELECT * from public.usuarios WHERE correo_electronico_usuario = %s", [message["correo_electronico_usuario"]])
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)
    else:
        print("value is not present for given JSON key")
        cursor.execute("SELECT * from public.usuarios")
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)

    return func.HttpResponse(cosa)
    

#Esta función solicita: nombre_usuario, primer_apellido_usuario, segundo_apellido_usuario, correo_electronico_usuario, contrasena_usuario, id_rol_usuario
@bpUsuarios.route(route="createUsuarios")
def createUsuarios(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed createPacientes request.')
    cursor = getConnection()[0]
    connection = getConnection()[1]
    
    message = req.get_json()
    
    if not ((message.get('nombre_usuario') is None) or (message.get('primer_apellido_usuario') is None) or (message.get('segundo_apellido_usuario') is None) or 
            (message.get('correo_electronico_usuario') is None) or (message.get('contrasena_usuario') is None) or (message.get('id_rol_usuario') is None)):
        print("value is present for given JSON key")
        try:
            query= ("INSERT INTO usuarios (nombre_usuario, primer_apellido_usuario, segundo_apellido_usuario, correo_electronico_usuario, contrasena_usuario, id_rol_usuario) VALUES ( %s, %s, %s, %s, %s, %s)")
            cursor.execute(query, [message["nombre_usuario"], message["primer_apellido_usuario"], message["segundo_apellido_usuario"], message["correo_electronico_usuario"], message["contrasena_usuario"], message["id_rol_usuario"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se agregó')
        except Exception as e:
            print(e)
            return func.HttpResponse('no se agregó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")
        return func.HttpResponse('no se agregó, faltaron parámetros')
    

@bpUsuarios.route(route="updateUsuarios")
def updateUsuarios(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed updateUsuarios request.')
    cursor = getConnection()[0]
    connection = getConnection()[1]
    
    message = req.get_json()
    
    if not ((message.get('nombre_usuario') is None) or (message.get('primer_apellido_usuario') is None) or (message.get('segundo_apellido_usuario') is None) or 
            (message.get('correo_electronico_usuario') is None) or (message.get('contrasena_usuario') is None) or (message.get('id_rol_usuario') is None) or
            (message.get('id_usuario') is None)):
        print("value is present for given JSON key")
        try:
            query= ("UPDATE usuarios SET nombre_usuario = %s, primer_apellido_usuario = %s, segundo_apellido_usuario = %s, correo_electronico_usuario = %s, contrasena_usuario = %s, id_rol_usuario = %s WHERE id_usuario = %s")
            cursor.execute(query, [message["nombre_usuario"], message["primer_apellido_usuario"], message["segundo_apellido_usuario"], message["correo_electronico_usuario"], message["contrasena_usuario"], message["id_rol_usuario"], message["id_usuario"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se modificó')
        except Exception as e:
            print(e)
            return func.HttpResponse('no se modificó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")
        return func.HttpResponse('no se modificó, faltaron parámetros')