// src/pages/CrearProducto.jsx

import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

const CrearProducto = () => {
  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

  // State variables for options
  const [categorias, setCategorias] = useState([]);
  const [tiposSuministro, setTiposSuministro] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch categories
        const responseCategorias = await fetch(
          "https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getCategoriaSuministro",
          {
            method: "POST", // Or "GET" based on your API
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // If your API requires an empty body
          }
        );
        const dataCategorias = await responseCategorias.json();
        setCategorias(dataCategorias);

        // Fetch tiposSuministro
        const responseTiposSuministro = await fetch(
          "https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getTiposSuministro",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        );
        const dataTiposSuministro = await responseTiposSuministro.json();
        setTiposSuministro(dataTiposSuministro);

        // Fetch unidadesMedida
        const responseUnidadesMedida = await fetch(
          "https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getUnidadMedida",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        );
        const dataUnidadesMedida = await responseUnidadesMedida.json();
        setUnidadesMedida(dataUnidadesMedida);

        setLoadingOptions(false);
      } catch (error) {
        console.error("Error fetching options:", error);
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Handler for form submission
  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      console.log("Form values:", values);
      // Prepare data to match API expectations
      const dataToSend = {
        nombre: {
          nombre_suministro: values.nombre_suministro,
          id_categoria_suministro: parseInt(values.id_categoria_suministro),
          id_tipo_suministro: parseInt(values.id_tipo_suministro),
          id_unidad_medida: parseInt(values.id_unidad_medida),
          cantidad_disponible: parseFloat(values.cantidad_disponible),
          stock_minimo: parseFloat(values.stock_minimo),
          fecha_ultima_actualizacion: values.fecha_ultima_actualizacion,
          nota_suministro: values.nota_suministro || "",
        },
      };

      // Make POST request to the backend API
      const response = await fetch(
        "https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/createSuministros",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json(); // Assuming API returns JSON
      console.log("Server response:", result);
      setOpenSuccessSnackbar(true);
      setTimeout(() => {
        resetForm();
        navigate("/inventario");
      }, 2000);
    } catch (error) {
      console.error("Error al enviar datos al servidor:", error);
      setOpenErrorSnackbar(true);
    }
    setSubmitting(false);
  };

  return (
    <Box m="20px">
      <Header title="Añadir Producto" subtitle="Datos del producto" />
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
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(3, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 3" },
              }}
            >
              {/* Nombre del Producto */}
              <TextField
                fullWidth
                variant="filled"
                label="Nombre del Producto"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nombre_suministro}
                name="nombre_suministro"
                error={!!touched.nombre_suministro && !!errors.nombre_suministro}
                helperText={touched.nombre_suministro && errors.nombre_suministro}
                sx={{ gridColumn: "span 3" }}
                required
              />

              {/* Categoría */}
              <FormControl variant="filled" sx={{ gridColumn: "span 1" }}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="id_categoria_suministro"
                  value={values.id_categoria_suministro}
                  onChange={handleChange}
                  error={
                    !!touched.id_categoria_suministro && !!errors.id_categoria_suministro
                  }
                  required
                  disabled={loadingOptions}
                >
                  {categorias.map((categoria) => (
                    <MenuItem
                      key={categoria.id_categoria_suministro}
                      value={categoria.id_categoria_suministro}
                    >
                      {categoria.nombre_categoria_suministro}
                    </MenuItem>
                  ))}
                </Select>
                {touched.id_categoria_suministro && errors.id_categoria_suministro && (
                  <Box color="error.main" fontSize="12px">
                    {errors.id_categoria_suministro}
                  </Box>
                )}
              </FormControl>

              {/* Tipo de Suministro */}
              <FormControl variant="filled" sx={{ gridColumn: "span 1" }}>
                <InputLabel>Tipo de Suministro</InputLabel>
                <Select
                  name="id_tipo_suministro"
                  value={values.id_tipo_suministro}
                  onChange={handleChange}
                  error={!!touched.id_tipo_suministro && !!errors.id_tipo_suministro}
                  required
                  disabled={loadingOptions}
                >
                  {tiposSuministro.map((tipo) => (
                    <MenuItem
                      key={tipo.id_tipo_suministro}
                      value={tipo.id_tipo_suministro}
                    >
                      {tipo.nombre_tipo_suministro}
                    </MenuItem>
                  ))}
                </Select>
                {touched.id_tipo_suministro && errors.id_tipo_suministro && (
                  <Box color="error.main" fontSize="12px">
                    {errors.id_tipo_suministro}
                  </Box>
                )}
              </FormControl>

              {/* Unidad de Medición */}
              <FormControl variant="filled" sx={{ gridColumn: "span 1" }}>
                <InputLabel>Unidad de Medición</InputLabel>
                <Select
                  name="id_unidad_medida"
                  value={values.id_unidad_medida}
                  onChange={handleChange}
                  error={!!touched.id_unidad_medida && !!errors.id_unidad_medida}
                  required
                  disabled={loadingOptions}
                >
                  {unidadesMedida.map((unidad) => (
                    <MenuItem
                      key={unidad.id_unidad_medida}
                      value={unidad.id_unidad_medida}
                    >
                      {unidad.nombre_unidad_medida}
                    </MenuItem>
                  ))}
                </Select>
                {touched.id_unidad_medida && errors.id_unidad_medida && (
                  <Box color="error.main" fontSize="12px">
                    {errors.id_unidad_medida}
                  </Box>
                )}
              </FormControl>

              {/* Cantidad Disponible */}
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Cantidad Disponible"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.cantidad_disponible}
                name="cantidad_disponible"
                error={
                  !!touched.cantidad_disponible && !!errors.cantidad_disponible
                }
                helperText={touched.cantidad_disponible && errors.cantidad_disponible}
                sx={{ gridColumn: "span 1" }}
                required
                inputProps={{ min: 0 }}
              />

              {/* Stock Mínimo */}
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Stock Mínimo"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.stock_minimo}
                name="stock_minimo"
                error={!!touched.stock_minimo && !!errors.stock_minimo}
                helperText={touched.stock_minimo && errors.stock_minimo}
                sx={{ gridColumn: "span 1" }}
                required
                inputProps={{ min: 0 }}
              />

              {/* Fecha de Actualización */}
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Fecha de Actualización"
                InputLabelProps={{ shrink: true }}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.fecha_ultima_actualizacion}
                name="fecha_ultima_actualizacion"
                error={
                  !!touched.fecha_ultima_actualizacion && !!errors.fecha_ultima_actualizacion
                }
                helperText={
                  touched.fecha_ultima_actualizacion && errors.fecha_ultima_actualizacion
                }
                sx={{ gridColumn: "span 1" }}
                required
              />

              {/* Nota del Suministro */}
              <TextField
                fullWidth
                variant="filled"
                label="Nota del Suministro"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nota_suministro}
                name="nota_suministro"
                error={!!touched.nota_suministro && !!errors.nota_suministro}
                helperText={touched.nota_suministro && errors.nota_suministro}
                sx={{ gridColumn: "span 3" }}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" mt="20px">
              <Button
                onClick={() => navigate("/inventario")}
                variant="outlined"
                color="primary"
              >
                Volver al Inventario
              </Button>
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                disabled={isSubmitting || !isValid}
              >
                Añadir Producto
              </Button>
            </Box>

            {/* Success Snackbar */}
            <Snackbar
              open={openSuccessSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenSuccessSnackbar(false)}
            >
              <Alert severity="success" sx={{ width: "100%" }}>
                Producto añadido exitosamente.
              </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
              open={openErrorSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenErrorSnackbar(false)}
            >
              <Alert severity="error" sx={{ width: "100%" }}>
                Por favor, revise todos los campos o inténtelo de nuevo.
              </Alert>
            </Snackbar>
          </form>
        )}
      </Formik>
    </Box>
  );
};

// Validation Schema
const validationSchema = yup.object().shape({
  nombre_suministro: yup.string().required("Obligatorio"),
  id_categoria_suministro: yup.string().required("Obligatorio"),
  id_tipo_suministro: yup.string().required("Obligatorio"),
  id_unidad_medida: yup.string().required("Obligatorio"),
  cantidad_disponible: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("Obligatorio"),
  stock_minimo: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("Obligatorio"),
  fecha_ultima_actualizacion: yup
    .date()
    .typeError("Debe ser una fecha válida")
    .required("Obligatorio"),
  nota_suministro: yup.string(),
});

// Initial Form Values
const initialValues = {
  nombre_suministro: "",
  id_categoria_suministro: "",
  id_tipo_suministro: "",
  id_unidad_medida: "",
  cantidad_disponible: "",
  stock_minimo: "",
  fecha_ultima_actualizacion: "",
  nota_suministro: "",
};

export default CrearProducto;
