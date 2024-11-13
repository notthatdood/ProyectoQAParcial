import azure.functions as func
import logging
import json
import psycopg2
import os
from Controllers.connection import getConnection


bpPacientes = func.Blueprint() 

#Recibe id_ciclo_menstrual y retorna solo esa columna o no recibe nada y retorna todas
@bpPacientes.route(route="getPacientes")
def getPacientes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed getPacientes request.')
    cursor = getConnection()[0]
    message = req.get_json()
    
    if not (message.get('id_paciente') is None):
        cosa = {}
        print("value is present for given JSON key")
        try:
            query =("SELECT * from pacientes WHERE id_paciente = %s;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            print(record)
            item = dict(record)
            cosa.update(item)

            query =("SELECT * from antecedentes_patologicos WHERE id_paciente = %s ORDER BY id_antecedente_patologico DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])

            if (cursor.rowcount == 0):
                cosa['primer_chequeo'] = True
                cosa = json.dumps(cosa, ensure_ascii=False, default=str)
                return func.HttpResponse(cosa)
            
            cosa['primer_chequeo'] = False
            record = cursor.fetchone()
            item = dict(record)
            cosa['antecedentes_patologicos'] = item

            query =("SELECT * from antecedentes_heredofamiliares WHERE id_paciente = %s ORDER BY id_antecedente_heredofamiliar DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['antecedentes_heredofamiliares'] = item

            query =("SELECT * from antecedentes_quirurgicos WHERE id_paciente = %s ORDER BY id_antecedente_quirurgico DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['antecedentes_quirurgicos'] = item

            query =("SELECT * from ciclo_menstrual WHERE id_paciente = %s ORDER BY id_ciclo_menstrual DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['ciclo_menstrual'] = item

            query =("SELECT * from actividad_sexual WHERE id_paciente = %s ORDER BY id_actividad_sexual DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['actividad_sexual'] = item

            query =("SELECT * from historial_obstetrico WHERE id_paciente = %s ORDER BY id_historial_obstetrico DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['historial_obstetrico'] = item

            query =("SELECT * from examenes_preventivos WHERE id_paciente = %s ORDER BY id_examen_preventivo DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['examenes_preventivos'] = item

            query =("SELECT * from motivo_consulta WHERE id_paciente = %s ORDER BY id_motivo_consulta DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['motivo_consulta'] = item

            query =("SELECT * from examen_fisico WHERE id_paciente = %s ORDER BY id_examen_fisico DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['examen_fisico'] = item

            query =("SELECT * from examen_ginecologico WHERE id_paciente = %s ORDER BY id_examen_ginecologico DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['examen_ginecologico'] = item

            query =("SELECT * from resumen_lista_problemas WHERE id_paciente = %s ORDER BY id_resumen DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['resumen_lista_problemas'] = item

            query =("SELECT * from plan_seguimiento WHERE id_paciente = %s ORDER BY id_plan_seguimiento DESC LIMIT 1;")
            cursor.execute(query, [message["id_paciente"]])
            record = cursor.fetchone()
            item = dict(record)
            cosa['plan_seguimiento'] = item
        except Exception as e:
            print(e)
            return func.HttpResponse(f'no se modificó, hubo un error durante el query {e}')

        cosa = json.dumps(cosa, ensure_ascii=False, default=str)
    else:
        print("value is not present for given JSON key")
        cursor.execute("SELECT * from pacientes")
        record = cursor.fetchall()
        cosa = json.dumps(record, ensure_ascii=False, default=str)

    return func.HttpResponse(cosa)


'''recibe id_paciente, nombre_paciente, primer_apellido_paciente, segundo_apellido_paciente, fecha_registro_paciente, fecha_nacimiento_paciente, 
    identificacion_paciente, id_estado_civil, ocupacion_paciente, lugar_residencia_paciente, numero_celular_paciente, correo_electronico_paciente, 
    activo_paciente'''
@bpPacientes.route(route="createPacientes")
def createPacientes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed createPacientes request.')
    cursor = getConnection()[0]
    connection = getConnection()[1]
    
    message = req.get_json()
    print(message)
    if not ((message.get('nombre_paciente') is None) or (message.get('primer_apellido_paciente') is None) or
            (message.get('segundo_apellido_paciente') is None) or (message.get('fecha_nacimiento_paciente') is None) or (message.get('fecha_registro_paciente') is None) or
            (message.get('identificacion_paciente') is None) or (message.get('id_estado_civil') is None) or (message.get('ocupacion_paciente') is None) or 
            (message.get('lugar_residencia_paciente') is None) or (message.get('numero_celular_paciente') is None) or (message.get('correo_electronico_paciente') is None)):
        print("value is present for given JSON key")
        try:
            query= (f"""DO $$
                        BEGIN 
                            INSERT INTO pacientes (nombre_paciente, primer_apellido_paciente, segundo_apellido_paciente, fecha_nacimiento_paciente, fecha_registro_paciente, 
                            identificacion_paciente, id_estado_civil, ocupacion_paciente, lugar_residencia_paciente, numero_celular_paciente, correo_electronico_paciente ) VALUES 
                            ( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                            
                            EXCEPTION WHEN OTHERS THEN
                                ROLLBACK;
                                RAISE EXCEPTION 'ERROR durante el insert de pacientes';
                            
                        END $$;""")
            
            cursor.execute(query, [message["nombre_paciente"], message["primer_apellido_paciente"], message["segundo_apellido_paciente"], message["fecha_nacimiento_paciente"], message["fecha_registro_paciente"], message["identificacion_paciente"], int(message["id_estado_civil"]), message["ocupacion_paciente"], message["lugar_residencia_paciente"], message["numero_celular_paciente"], message["correo_electronico_paciente"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se agregó')
        except Exception as e: 
            print(e)
            return func.HttpResponse('no se agregó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")

        return func.HttpResponse('no se agregó, faltaron parámetros')
    

@bpPacientes.route(route="updatePacientes")
def updatePacientes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed updatePacientes request.')
    try: 
        cursor = getConnection()[0]
        connection = getConnection()[1]
    except Exception as e:
        print(e)
        return func.HttpResponse('no se modificó, hubo un error en la conección con la base')

    try:
        message = req.get_json()
    except Exception as e:
        print(e)
        return func.HttpResponse(f'no se modificó, hubo un error en el json {e}')

    if not ((message.get('id_paciente') is None) or (message.get('nombre_paciente') is None) or (message.get('primer_apellido_paciente') is None) or
            (message.get('segundo_apellido_paciente') is None) or (message.get('fecha_nacimiento_paciente') is None) or (message.get('fecha_registro_paciente') is None) or
            (message.get('identificacion_paciente') is None) or (message.get('id_estado_civil') is None) or (message.get('ocupacion_paciente') is None) or 
            (message.get('lugar_residencia_paciente') is None) or (message.get('numero_celular_paciente') is None) or (message.get('correo_electronico_paciente') is None) or
            (message.get('epi') is None) or (message.get('hepatitis') is None) or (message.get('hta') is None) or (message.get('diabetes') is None) or
            (message.get('diabetes_heredofamiliar') is None) or (message.get('cancer_mama_heredofamiliar') is None) or (message.get('hta_heredofamiliar') is None) or
            (message.get('cancer_heredofamiliar') is None) or (message.get('cardiacos_heredofamiliar') is None) or (message.get('enfermedades_mentales_heredofamiliar') is None) or
            (message.get('cirugias_abdominales_antecedente') is None) or (message.get('edad_menarca_ciclo') is None) or (message.get('ritmo_menstrual_periodico') is None) or
            (message.get('id_cantidad_sangrado') is None) or (message.get('dismenorrea') is None) or (message.get('fecha_ultima_menstruacion') is None) or
            (message.get('edad_primera_relacion_sexual') is None) or (message.get('id_orientacion_sexual') is None) or (message.get('id_numero_parejas') is None) or
            (message.get('factores_riesgo_sexual') is None) or (message.get('dispareunia') is None) or (message.get('sangrado_sexual') is None) or
            (message.get('libido') is None) or (message.get('orgasmo') is None) or (message.get('lubricacion') is None) or
            (message.get('metodos_anticonceptivos_tiempo') is None) or (message.get('numero_gestaciones') is None) or (message.get('numero_partos') is None) or
            (message.get('numero_abortos') is None) or (message.get('numero_total_embarazos') is None) or (message.get('numero_total_partos') is None) or
            (message.get('numero_puerperios') is None) or (message.get('lactancia') is None) or (message.get('fecha_ultimo_parto') is None) or
            (message.get('fecha_ultimo_papanicolaou') is None) or (message.get('fecha_ultima_mamografia') is None) or (message.get('fecha_ultima_densitometria') is None) or
            (message.get('fecha_ultimo_ultrasonido_pelvico') is None) or (message.get('motivo_consulta') is None) or (message.get('presion_arterial') is None) or
            (message.get('frecuencia_pulso') is None) or (message.get('frecuencia_cardiaca') is None) or (message.get('frecuencia_respiratoria') is None) or
            (message.get('peso') is None) or (message.get('altura') is None) or (message.get('indice_masa_corporal') is None) or
            (message.get('cabeza_cuello_examen') is None) or (message.get('torax_examen') is None) or (message.get('mamas_examen') is None) or
            (message.get('abdomen_examen') is None) or (message.get('fosas_iliacas_examen') is None) or 
            (message.get('vulva_examen') is None) or (message.get('cuello_uterino_examen') is None) or (message.get('bulbo_uretral_skene_examen') is None) or
            (message.get('utero_examen') is None) or (message.get('perine_examen') is None) or (message.get('vagina_examen') is None) or
            (message.get('colposcopia_examen') is None) or (message.get('anexos_uterinos_examen') is None) or (message.get('resumen_problemas') is None) or 
            (message.get('resumen_problemas') is None)):
        
        
        
        try:
            query= (f"""DO $$
                        BEGIN 
                            UPDATE pacientes SET nombre_paciente = %s, primer_apellido_paciente = %s, segundo_apellido_paciente = %s, fecha_nacimiento_paciente = %s, fecha_registro_paciente = %s, 
                            id_estado_civil = %s, ocupacion_paciente = %s, lugar_residencia_paciente = %s, numero_celular_paciente = %s, correo_electronico_paciente = %s
                            WHERE id_paciente = %s;
                            INSERT INTO antecedentes_patologicos (
                                id_paciente,
                                epi,
                                hepatitis,
                                hta,
                                diabetes
                            )
                            VALUES (
                                %s,
                                %s,
                                %s,
                                %s,
                                %s
                            );
                            INSERT INTO antecedentes_heredofamiliares (
                                id_paciente,
                                diabetes_heredofamiliar,
                                cardiacos_heredofamiliar,
                                hta_heredofamiliar,
                                cancer_heredofamiliar,
                                cancer_mama_heredofamiliar,
                                enfermedades_mentales_heredofamiliar
                            )
                            VALUES (
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s
                            );
                            INSERT INTO antecedentes_quirurgicos (
                                id_paciente,
                                cirugias_abdominales_antecedente
                            )
                            VALUES (
                                %s,
                                %s
                            );
                            INSERT INTO ciclo_menstrual (
                                id_paciente,
                                edad_menarca_ciclo,
                                ritmo_menstrual_periodico,
                                id_cantidad_sangrado,
                                dismenorrea,
                                fecha_ultima_menstruacion
                            )
                            VALUES (
                                %s,
                                %s,
                                %s,
                                %s,  
                                %s,
                                %s
                            );
                            INSERT INTO actividad_sexual (
                                id_paciente,
                                edad_primera_relacion_sexual,
                                id_orientacion_sexual,
                                id_numero_parejas,
                                factores_riesgo_sexual,
                                dispareunia,
                                sangrado_sexual,
                                libido,
                                orgasmo,
                                lubricacion,
                                metodos_anticonceptivos_tiempo
                            )
                            VALUES (
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s
                            );
                            INSERT INTO historial_obstetrico (
                                id_paciente,
                                numero_gestaciones,
                                numero_partos,
                                numero_abortos,
                                numero_total_embarazos,
                                numero_total_partos,
                                numero_puerperios,
                                lactancia,
                                fecha_ultimo_parto
                            )
                            VALUES (
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s
                            );
                            INSERT INTO examenes_preventivos (
                                id_paciente,
                                fecha_ultimo_papanicolaou,
                                fecha_ultima_mamografia,
                                fecha_ultima_densitometria,
                                fecha_ultimo_ultrasonido_pelvico
                            )
                            VALUES (
                                %s,
                                %s,
                                %s,
                                %s,
                                %s
                            );
                            INSERT INTO motivo_consulta (
                                id_paciente,
                                motivo_consulta
                            )
                            VALUES (
                                %s,
                                %s
                            );
                            INSERT INTO examen_fisico (
                                id_paciente,
                                presion_arterial,
                                frecuencia_pulso,
                                frecuencia_cardiaca,
                                frecuencia_respiratoria,
                                peso,
                                altura,
                                indice_masa_corporal,
                                cabeza_cuello_examen,
                                torax_examen,
                                mamas_examen,
                                abdomen_examen,
                                fosas_iliacas_examen
                            )
                            VALUES (
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s
                            );

                            INSERT INTO examen_ginecologico (
                                id_paciente,
                                vulva_examen,
                                cuello_uterino_examen,
                                bulbo_uretral_skene_examen,
                                utero_examen,
                                perine_examen,
                                vagina_examen,
                                colposcopia_examen,
                                anexos_uterinos_examen
                            )
                            VALUES (
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                %s
                            );
                            INSERT INTO resumen_lista_problemas (
                                id_paciente,
                                resumen_problemas
                            )
                            VALUES (
                                %s,
                                %s
                            );
                            INSERT INTO plan_seguimiento (
                                id_paciente,
                                plan_seguimiento
                            )
                            VALUES (
                                %s,
                                %s
                            );

                            EXCEPTION WHEN OTHERS THEN
                                ROLLBACK;
                                RAISE EXCEPTION '%%', SQLERRM;
                        END $$;""")
            cursor.execute(query, (message["nombre_paciente"], message["primer_apellido_paciente"], message["segundo_apellido_paciente"], 
                                    message["fecha_nacimiento_paciente"], message["fecha_registro_paciente"], 
                                    int(message["id_estado_civil"]), message["ocupacion_paciente"], message["lugar_residencia_paciente"], 
                                    message["numero_celular_paciente"], message["correo_electronico_paciente"], message["id_paciente"],
                                    
                                    int(message["id_paciente"]), bool(message["epi"]), bool(message["hepatitis"]),
                                    bool(message["hta"]), bool(message["diabetes"]), 
                                    
                                    int(message["id_paciente"]), bool(message["diabetes_heredofamiliar"]), bool(message["cardiacos_heredofamiliar"]),
                                    bool(message["hta_heredofamiliar"]), bool(message["cancer_heredofamiliar"]), bool(message["cancer_mama_heredofamiliar"]),
                                    bool(message["enfermedades_mentales_heredofamiliar"]), 
                                    
                                    int(message["id_paciente"]), message["cirugias_abdominales_antecedente"], 

                                    int(message["id_paciente"]), int(message["edad_menarca_ciclo"]), bool(message["ritmo_menstrual_periodico"]),
                                    int(message["id_cantidad_sangrado"]), bool(message["dismenorrea"]), message["fecha_ultima_menstruacion"],
                                    
                                    int(message["id_paciente"]), int(message["edad_primera_relacion_sexual"]), int(message["id_orientacion_sexual"]),
                                    int(message["id_numero_parejas"]), message["factores_riesgo_sexual"], bool(message["dispareunia"]),
                                    bool(message["sangrado_sexual"]), bool(message["libido"]), bool(message["orgasmo"]),
                                    bool(message["lubricacion"]), message["metodos_anticonceptivos_tiempo"], 
                                    
                                    int(message["id_paciente"]), int(message["numero_gestaciones"]), int(message["numero_partos"]),
                                    int(message["numero_abortos"]), int(message["numero_total_embarazos"]), int(message["numero_total_partos"]),
                                    int(message["numero_puerperios"]), bool(message["lactancia"]), message["fecha_ultimo_parto"],

                                    int(message["id_paciente"]), message["fecha_ultimo_papanicolaou"], message["fecha_ultima_mamografia"],
                                    message["fecha_ultima_densitometria"], message["fecha_ultimo_ultrasonido_pelvico"], 

                                    int(message["id_paciente"]), message["motivo_consulta"],

                                    int(message["id_paciente"]), message["presion_arterial"], int(message["frecuencia_pulso"]),
                                    int(message["frecuencia_cardiaca"]), int(message["frecuencia_respiratoria"]), float(message["peso"]),
                                    float(message["altura"]), float(message["indice_masa_corporal"]), message["cabeza_cuello_examen"],
                                    message["torax_examen"], message["mamas_examen"], message["abdomen_examen"],
                                    message["fosas_iliacas_examen"], 

                                    int(message["id_paciente"]), message["vulva_examen"], message["cuello_uterino_examen"],
                                    message["bulbo_uretral_skene_examen"], message["utero_examen"], message["perine_examen"],
                                    message["vagina_examen"], message["colposcopia_examen"], message["anexos_uterinos_examen"],

                                    int(message["id_paciente"]), message["resumen_problemas"],

                                    int(message["id_paciente"]), message["plan_seguimiento"]))
            cursor.close()
            connection.close()
            return func.HttpResponse('se modificó')
        except Exception as e: 
            print(e)
            return func.HttpResponse(f'no se modificó, hubo un error en la ejecución del query: {e}')
        
    else:
        print("value is not present for given JSON key")

        return func.HttpResponse('no se modificó, faltaron parámetros')
    

@bpPacientes.route(route="deletePacientes")
def deletePacientes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed deletePacientes request.')
    try: 
        cursor = getConnection()[0]
        connection = getConnection()[1]
    except Exception as e:
        print(e)
        return func.HttpResponse('no se eliminó, hubo un error en la conección con la base')

    
    message = req.get_json()
    
    if not (message.get('id_paciente') is None):
        print("value is present for given JSON key")
        try:
            query= ("DELETE FROM pacientes WHERE id_paciente = %s")
            cursor.execute(query, [message["id_paciente"]])
            cursor.close()
            connection.close()
            return func.HttpResponse('se eliminó')
        except Exception as e: 
            print(e)
            return func.HttpResponse('no se eliminó, hubo un error en la ejecución del query')
        
    else:
        print("value is not present for given JSON key")

        return func.HttpResponse('no se eliminó, faltaron parámetros')