// src/pages/CrearProveedor.jsx

import { Box, Button, TextField, Snackbar, Alert, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useNavigate } from 'react-router-dom';
import React from 'react';

const CrearProveedor = () => {
  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navegar = useNavigate();
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = React.useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = React.useState(false);

  const handleFormSubmit = (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      // Since there's no API or database, we'll just log the values
      console.log('Proveedor agregado:', values);
      setOpenSuccessSnackbar(true);
      setTimeout(() => {
        resetForm();
        navegar('/inventario');
      }, 2000);
    } catch (error) {
      console.error('Error al agregar proveedor:', error);
      setOpenErrorSnackbar(true);
    }
    setSubmitting(false);
  };

  return (
    <Box m="20px">
      <Header title="Añadir Proveedor" subtitle="Datos del proveedor" />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isValid,
          isSubmitting
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(2, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 2" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                label="Nombre del Proveedor"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nombre}
                name="nombre"
                error={!!touched.nombre && !!errors.nombre}
                helperText={touched.nombre && errors.nombre}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                label="Contacto"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contacto}
                name="contacto"
                error={!!touched.contacto && !!errors.contacto}
                helperText={touched.contacto && errors.contacto}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                label="Teléfono"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.telefono}
                name="telefono"
                error={!!touched.telefono && !!errors.telefono}
                helperText={touched.telefono && errors.telefono}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                label="Dirección"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.direccion}
                name="direccion"
                error={!!touched.direccion && !!errors.direccion}
                helperText={touched.direccion && errors.direccion}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" mt="20px">
              <Button
                onClick={() => navegar('/inventario')}
                variant="outlined"
                color="primary"
              >
                Volver al Inventario
              </Button>
              <Button type="submit" color="secondary" variant="contained" disabled={isSubmitting || !isValid}>
                Añadir Proveedor
              </Button>
            </Box>

            <Snackbar open={openErrorSnackbar} autoHideDuration={6000} onClose={() => setOpenErrorSnackbar(false)}>
              <Alert severity="error" sx={{ width: '100%' }}>
                Por favor, revise todos los campos.
              </Alert>
            </Snackbar>
            <Snackbar open={openSuccessSnackbar} autoHideDuration={6000} onClose={() => setOpenSuccessSnackbar(false)}>
              <Alert severity="success" sx={{ width: '100%' }}>
                Proveedor añadido exitosamente.
              </Alert>
            </Snackbar>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const validationSchema = yup.object().shape({
  nombre: yup.string().required("Obligatorio"),
  contacto: yup.string().required("Obligatorio"),
  telefono: yup.string().required("Obligatorio"),
  email: yup.string().email("Email inválido").required("Obligatorio"),
  direccion: yup.string().required("Obligatorio"),
});

const initialValues = {
  nombre: "",
  contacto: "",
  telefono: "",
  email: "",
  direccion: "",
};

export default CrearProveedor;
