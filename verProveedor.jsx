// src/pages/VerProveedor.jsx

import React from 'react';
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

const VerProveedor = () => {
  const location = useLocation();
  const proveedorData = location.state?.proveedorData;

  const navigate = useNavigate();

  if (!proveedorData) {
    navigate('/inventario'); // Redirect if no data
    return null;
  }

  const handleBack = () => {
    navigate('/inventario');
  };

  const handleEdit = () => {
    navigate(`/edit/editarProveedor`, { state: { proveedorData } });
  };

  return (
    <Box padding={3}>
      <Header
        title="Detalles del Proveedor"
        subtitle="Información detallada del proveedor seleccionado"
      />
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Información del Proveedor</Typography>
          <Typography variant="body1">Nombre: {proveedorData.nombre}</Typography>
          <Typography variant="body1">Contacto: {proveedorData.contacto}</Typography>
          <Typography variant="body1">Teléfono: {proveedorData.telefono}</Typography>
          <Typography variant="body1">Email: {proveedorData.email}</Typography>
          <Typography variant="body1">Dirección: {proveedorData.direccion}</Typography>
        </CardContent>
      </Card>
      <Box mt={2} display="flex" justifyContent="space-between">
        <Button variant="contained" onClick={handleBack}>Regresar</Button>
        <Button variant="contained" color="secondary" onClick={handleEdit}>
          Editar
        </Button>
      </Box>
    </Box>
  );
};

export default VerProveedor;
