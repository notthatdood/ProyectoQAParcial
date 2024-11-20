import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import useMediaQuery from '@mui/material/useMediaQuery';
import Header from '../../components/Header';
import { useNavigate, useParams } from 'react-router-dom';

const EditarInventario = () => {
  const theme = useTheme();
  const isNonMobile = useMediaQuery('(min-width:600px)');
  const navigate = useNavigate();
  const { id } = useParams(); // Get the id_suministro from the URL
  const [suministroData, setSuministroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

  // State for fetched data for select options
  const [categorias, setCategorias] = useState([]);
  const [tiposSuministro, setTiposSuministro] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);

  // Fetch the suministro data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the suministro data by id
        const response = await fetch(
          'https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getSuministroById',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_suministro: id }),
          }
        );

        if (!response.ok) {
          throw new Error('Error fetching suministro data');
        }

        const data = await response.json();
        setSuministroData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching suministro data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch data for select options
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        // Fetch categorias
        const categoriasResponse = await fetch(
          'https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getCategorias',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          }
        );

        // Fetch tiposSuministro
        const tiposResponse = await fetch(
          'https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getTiposSuministro',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          }
        );

        // Fetch unidadesMedida
        const unidadesResponse = await fetch(
          'https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getUnidadesMedida',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          }
        );

        if (
          !categoriasResponse.ok ||
          !tiposResponse.ok ||
          !unidadesResponse.ok
        ) {
          throw new Error('Error fetching select data');
        }

        const categoriasData = await categoriasResponse.json();
        const tiposData = await tiposResponse.json();
        const unidadesData = await unidadesResponse.json();

        setCategorias(categoriasData);
        setTiposSuministro(tiposData);
        setUnidadesMedida(unidadesData);
      } catch (error) {
        console.error('Error fetching select data:', error);
      }
    };

    fetchSelectData();
  }, []);

  // Validation schema
  const validationSchema = yup.object().shape({
    nombre_suministro: yup.string().required('Obligatorio'),
    id_categoria_suministro: yup.string().required('Obligatorio'),
    id_tipo_suministro: yup.string().required('Obligatorio'),
    id_unidad_medida: yup.string().required('Obligatorio'),
    cantidad_disponible: yup
      .number()
      .required('Obligatorio')
      .min(0, 'No puede ser negativo'),
    stock_minimo: yup
      .number()
      .required('Obligatorio')
      .min(0, 'No puede ser negativo'),
    fecha_ultima_actualizacion: yup.date().required('Obligatorio'),
    nota_suministro: yup.string(),
  });

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      // Prepare data to send to backend
      const dataToSend = {
        id_suministro: id,
        nombre_suministro: values.nombre_suministro,
        id_categoria_suministro: parseInt(values.id_categoria_suministro),
        id_tipo_suministro: parseInt(values.id_tipo_suministro),
        id_unidad_medida: parseInt(values.id_unidad_medida),
        cantidad_disponible: parseFloat(values.cantidad_disponible),
        stock_minimo: parseFloat(values.stock_minimo),
        fecha_ultima_actualizacion: values.fecha_ultima_actualizacion,
        nota_suministro: values.nota_suministro || '',
      };

      // Make POST request to update the suministro
      const response = await fetch(
        'https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/updateSuministros',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

      const result = await response.json();
      console.log('Update result:', result);
      setOpenSuccessSnackbar(true);
      setTimeout(() => {
        navigate('/inventario');
      }, 2000);
    } catch (error) {
      console.error('Error updating suministro:', error);
      setOpenErrorSnackbar(true);
    }
    setSubmitting(false);
  };

  if (loading || !suministroData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt="50px">
        <CircularProgress />
      </Box>
    );
  }

  const initialValues = {
    nombre_suministro: suministroData.nombre_suministro || '',
    id_categoria_suministro:
      suministroData.id_categoria_suministro.toString() || '',
    id_tipo_suministro:
      suministroData.id_tipo_suministro.toString() || '',
    id_unidad_medida: suministroData.id_unidad_medida.toString() || '',
    cantidad_disponible: suministroData.cantidad_disponible || '',
    stock_minimo: suministroData.stock_minimo || '',
    fecha_ultima_actualizacion:
      suministroData.fecha_ultima_actualizacion || '',
    nota_suministro: suministroData.nota_suministro || '',
  };

  return (
    <Box m="20px">
      <Header
        title="Editar Producto"
        subtitle="Actualiza la información del producto"
      />
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
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
                '& > div': { gridColumn: isNonMobile ? undefined : 'span 3' },
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
                error={
                  !!touched.nombre_suministro && !!errors.nombre_suministro
                }
                helperText={
                  touched.nombre_suministro && errors.nombre_suministro
                }
                sx={{ gridColumn: 'span 3' }}
                required
              />

              {/* Categoría */}
              <FormControl variant="filled" sx={{ gridColumn: 'span 1' }}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="id_categoria_suministro"
                  value={values.id_categoria_suministro}
                  onChange={handleChange}
                  error={
                    !!touched.id_categoria_suministro &&
                    !!errors.id_categoria_suministro
                  }
                  required
                >
                  {categorias.map((categoria) => (
                    <MenuItem
                      key={categoria.id_categoria_suministro}
                      value={categoria.id_categoria_suministro.toString()}
                    >
                      {categoria.nombre_categoria}
                    </MenuItem>
                  ))}
                </Select>
                {touched.id_categoria_suministro &&
                  errors.id_categoria_suministro && (
                    <Box color="error.main" fontSize="12px">
                      {errors.id_categoria_suministro}
                    </Box>
                  )}
              </FormControl>

              {/* Tipo de Suministro */}
              <FormControl variant="filled" sx={{ gridColumn: 'span 1' }}>
                <InputLabel>Tipo de Suministro</InputLabel>
                <Select
                  name="id_tipo_suministro"
                  value={values.id_tipo_suministro}
                  onChange={handleChange}
                  error={
                    !!touched.id_tipo_suministro && !!errors.id_tipo_suministro
                  }
                  required
                >
                  {tiposSuministro.map((tipo) => (
                    <MenuItem
                      key={tipo.id_tipo_suministro}
                      value={tipo.id_tipo_suministro.toString()}
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
              <FormControl variant="filled" sx={{ gridColumn: 'span 1' }}>
                <InputLabel>Unidad de Medición</InputLabel>
                <Select
                  name="id_unidad_medida"
                  value={values.id_unidad_medida}
                  onChange={handleChange}
                  error={
                    !!touched.id_unidad_medida && !!errors.id_unidad_medida
                  }
                  required
                >
                  {unidadesMedida.map((unidad) => (
                    <MenuItem
                      key={unidad.id_unidad_medida}
                      value={unidad.id_unidad_medida.toString()}
                    >
                      {unidad.nombre_unidad}
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
                helperText={
                  touched.cantidad_disponible && errors.cantidad_disponible
                }
                sx={{ gridColumn: 'span 1' }}
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
                sx={{ gridColumn: 'span 1' }}
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
                  !!touched.fecha_ultima_actualizacion &&
                  !!errors.fecha_ultima_actualizacion
                }
                helperText={
                  touched.fecha_ultima_actualizacion &&
                  errors.fecha_ultima_actualizacion
                }
                sx={{ gridColumn: 'span 1' }}
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
                error={
                  !!touched.nota_suministro && !!errors.nota_suministro
                }
                helperText={touched.nota_suministro && errors.nota_suministro}
                sx={{ gridColumn: 'span 3' }}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" mt="20px">
              <Button
                onClick={() => navigate('/inventario')}
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
                Guardar Cambios
              </Button>
            </Box>

            {/* Success Snackbar */}
            <Snackbar
              open={openSuccessSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenSuccessSnackbar(false)}
            >
              <Alert severity="success" sx={{ width: '100%' }}>
                Producto actualizado exitosamente.
              </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
              open={openErrorSnackbar}
              autoHideDuration={6000}
              onClose={() => setOpenErrorSnackbar(false)}
            >
              <Alert severity="error" sx={{ width: '100%' }}>
                Error al actualizar el producto. Por favor, inténtelo de nuevo.
              </Alert>
            </Snackbar>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default EditarInventario;
