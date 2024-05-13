import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/GestionProyectos.css';

const NavbarProyectos = () => {
    return (
      <div className='content'>
        <div className='flex-div'>
          <div className='name-content'>
            <h1 className='logo'>Gestión de Proyectos</h1>
          </div>
          <form className="proye"> 
            <Link className='boton' to="/crearProyecto">Crear Proyecto</Link>
            <Link className='boton' to="/consultarProyecto">Consultar Proyecto</Link>
            <Link className='boton' to="/modificarProyecto">Modificar Proyecto</Link>
            <Link className='boton' to="/reuniones">Crear Reunión</Link>
            <Link className='back' to="/menu">Regresar</Link>
          </form>
        </div>
      </div>
    );
  }

export default NavbarProyectos;