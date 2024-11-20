import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  useTheme
} from "@mui/material";
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { tokens } from "../../theme";

// Hardcoded motives
const MOTIVOS_ENTRADA = [
  { id_motivo_entrada: 1, nombre_motivo_entrada: "Regalía" },
  { id_motivo_entrada: 2, nombre_motivo_entrada: "Compra" },
  { id_motivo_entrada: 3, nombre_motivo_entrada: "Donación" }
];

const MOTIVOS_SALIDA = [
  { id_motivo_salida: 1, nombre_motivo_salida: "Uso Clínico" },
  { id_motivo_salida: 2, nombre_motivo_salida: "Uso Interno" },
  { id_motivo_salida: 3, nombre_motivo_salida: "Vencimiento" },
  { id_motivo_salida: 4, nombre_motivo_salida: "Limpieza" }
];

const VerProducto = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const location = useLocation();
  const productoData = location.state?.productoData;
  const navigate = useNavigate();
  
  // States
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [providers, setProviders] = useState([]);
  const [movementHistory, setMovementHistory] = useState({ entries: [], exits: [] });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Entry form state
  const [entryForm, setEntryForm] = useState({
    cantidad_entrada: '',
    fecha_entrada: new Date().toISOString().split('T')[0],
    id_motivo_entrada: '',
    id_entidad: '',
    justificacion_entrada: '',
    observacion_entrada: '',
    descripcion_entrada: ''
  });

  // Exit form state
  const [exitForm, setExitForm] = useState({
    cantidad_salida: '',
    fecha_salida: new Date().toISOString().split('T')[0],
    id_motivo_salida: '',
    justificacion_salida: '',
    observacion_salida: '',
    descripcion_salida: ''
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providersRes, entriesRes, exitsRes] = await Promise.all([
          fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getEntidades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }),
          fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getEntradasSuministro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }),
          fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getSalidasSuministro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          })
        ]);

        const [providersData, entriesData, exitsData] = await Promise.all([
          providersRes.json(),
          entriesRes.json(),
          exitsRes.json()
        ]);

        setProviders(providersData);

        const productEntries = entriesData.filter(entry => 
          entry.id_suministro === productoData.id_suministro
        );
        const productExits = exitsData.filter(exit => 
          exit.id_suministro === productoData.id_suministro
        );

        setMovementHistory({ entries: productEntries, exits: productExits });

      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Error al cargar los datos', 'error');
      }
    };

    if (productoData) {
      fetchData();
    }
  }, [productoData]);
  const handleEntrySubmit = async () => {
    try {
      // First create the entry
      const response = await fetch(
        'https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/createEntradasSuministro',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...entryForm,
            id_suministro: productoData.id_suministro
          })
        }
      );
  
      if (!response.ok) {
        throw new Error('Error al registrar la entrada');
      }
  
      // Then update the suministro's cantidad_disponible
      const newCantidad = parseFloat(productoData.cantidad_disponible) + parseFloat(entryForm.cantidad_entrada);
      
      const updateResponse = await fetch(
        'https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/updateSuministros',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_suministro: productoData.id_suministro,
            nombre_suministro: productoData.nombre_suministro,
            id_categoria_suministro: productoData.id_categoria_suministro,
            id_tipo_suministro: productoData.id_tipo_suministro,
            id_unidad_medida: productoData.id_unidad_medida,
            cantidad_disponible: newCantidad,
            stock_minimo: productoData.stock_minimo,
            fecha_ultima_actualizacion: new Date().toISOString().split('T')[0],
            nota_suministro: productoData.nota_suministro
          })
        }
      );
  
      if (!updateResponse.ok) {
        throw new Error('Error al actualizar la cantidad disponible');
      }
  
      showSnackbar('Entrada registrada exitosamente', 'success');
      setEntryDialogOpen(false);
      // Refresh page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al registrar la entrada', 'error');
    }
  };
  
  const handleExitSubmit = async () => {
    try {
      // Check if there's enough stock
      const requestedQuantity = parseFloat(exitForm.cantidad_salida);
      const availableQuantity = parseFloat(productoData.cantidad_disponible);
      
      if (requestedQuantity > availableQuantity) {
        showSnackbar('No hay suficiente stock disponible', 'error');
        return;
      }
  
      // First create the exit
      const response = await fetch(
        'https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/createSalidasSuministro',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...exitForm,
            id_suministro: productoData.id_suministro
          })
        }
      );
  
      if (!response.ok) {
        throw new Error('Error al registrar la salida');
      }
  
      // Then update the suministro's cantidad_disponible
      const newCantidad = availableQuantity - requestedQuantity;
      
      const updateResponse = await fetch(
        'https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/updateSuministros',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_suministro: productoData.id_suministro,
            nombre_suministro: productoData.nombre_suministro,
            id_categoria_suministro: productoData.id_categoria_suministro,
            id_tipo_suministro: productoData.id_tipo_suministro,
            id_unidad_medida: productoData.id_unidad_medida,
            cantidad_disponible: newCantidad,
            stock_minimo: productoData.stock_minimo,
            fecha_ultima_actualizacion: new Date().toISOString().split('T')[0],
            nota_suministro: productoData.nota_suministro
          })
        }
      );
  
      if (!updateResponse.ok) {
        throw new Error('Error al actualizar la cantidad disponible');
      }
  
      showSnackbar('Salida registrada exitosamente', 'success');
      setExitDialogOpen(false);
      // Refresh page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al registrar la salida', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  if (!productoData) {
    navigate('/inventario');
    return null;
  }

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Detalles del Producto" subtitle="Información detallada y movimientos" />
      </Box>

      <Grid container spacing={3}>
        {/* Product Info Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: colors.primary[400] }}>
            <CardContent>
              <Typography variant="h5" color={colors.grey[100]} gutterBottom>
                Información del Producto
              </Typography>
              <Typography variant="body1" color={colors.grey[100]}>
                Nombre: {productoData.nombre_suministro}
              </Typography>
              <Typography variant="body1" color={colors.grey[100]}>
                Cantidad Disponible: {productoData.cantidad_disponible}
              </Typography>
              <Typography variant="body1" color={colors.grey[100]}>
                Stock Mínimo: {productoData.stock_minimo}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: colors.primary[400] }}>
            <CardContent>
              <Box display="flex" gap={2} justifyContent="space-around">
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutline />}
                  onClick={() => setEntryDialogOpen(true)}
                  sx={{
                    backgroundColor: colors.greenAccent[600],
                    color: colors.grey[100],
                    '&:hover': { backgroundColor: colors.greenAccent[700] }
                  }}
                >
                  Registrar Entrada
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RemoveCircleOutline />}
                  onClick={() => setExitDialogOpen(true)}
                  sx={{
                    backgroundColor: colors.redAccent[600],
                    color: colors.grey[100],
                    '&:hover': { backgroundColor: colors.redAccent[700] }
                  }}
                >
                  Registrar Salida
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Movements History */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: colors.primary[400] }}>
            <CardContent>
              <Typography variant="h5" color={colors.grey[100]} gutterBottom>
                Historial de Movimientos
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: colors.grey[100] }}>Fecha</TableCell>
                      <TableCell sx={{ color: colors.grey[100] }}>Tipo</TableCell>
                      <TableCell sx={{ color: colors.grey[100] }}>Cantidad</TableCell>
                      <TableCell sx={{ color: colors.grey[100] }}>Motivo</TableCell>
                      <TableCell sx={{ color: colors.grey[100] }}>Observación</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ...movementHistory.entries.map(entry => ({
                        type: 'Entrada',
                        date: entry.fecha_entrada,
                        quantity: entry.cantidad_entrada,
                        motive: MOTIVOS_ENTRADA.find(m => m.id_motivo_entrada === entry.id_motivo_entrada)?.nombre_motivo_entrada || 'Desconocido',
                        observation: entry.observacion_entrada
                      })),
                      ...movementHistory.exits.map(exit => ({
                        type: 'Salida',
                        date: exit.fecha_salida,
                        quantity: exit.cantidad_salida,
                        motive: MOTIVOS_SALIDA.find(m => m.id_motivo_salida === exit.id_motivo_salida)?.nombre_motivo_salida || 'Desconocido',
                        observation: exit.observacion_salida
                      }))
                    ]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((movement, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: colors.grey[100] }}>
                          {new Date(movement.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ color: colors.grey[100] }}>
                          {movement.type}
                        </TableCell>
                        <TableCell sx={{ color: colors.grey[100] }}>
                          {movement.quantity}
                        </TableCell>
                        <TableCell sx={{ color: colors.grey[100] }}>
                          {movement.motive}
                        </TableCell>
                        <TableCell sx={{ color: colors.grey[100] }}>
                          {movement.observation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Entry Dialog */}
      <Dialog 
        open={entryDialogOpen} 
        onClose={() => setEntryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Registrar Entrada</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={entryForm.cantidad_entrada}
                onChange={(e) => setEntryForm({ ...entryForm, cantidad_entrada: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                value={entryForm.fecha_entrada}
                onChange={(e) => setEntryForm({ ...entryForm, fecha_entrada: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Motivo de Entrada</InputLabel>
                <Select
                  value={entryForm.id_motivo_entrada}
                  onChange={(e) => setEntryForm({ ...entryForm, id_motivo_entrada: e.target.value })}
                >
                  {MOTIVOS_ENTRADA.map((motive) => (
                    <MenuItem key={motive.id_motivo_entrada} value={motive.id_motivo_entrada}>
                      {motive.nombre_motivo_entrada}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={entryForm.id_entidad}
                  onChange={(e) => setEntryForm({ ...entryForm, id_entidad: e.target.value })}
                >
                  {providers.map((provider) => (
                    <MenuItem key={provider.id_entidad} value={provider.id_entidad}>
                      {provider.nombre_entidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Justificación"
                value={entryForm.justificacion_entrada}
                onChange={(e) => setEntryForm({ ...entryForm, justificacion_entrada: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observación"
                value={entryForm.observacion_entrada}
                onChange={(e) => setEntryForm({ ...entryForm, observacion_entrada: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={4}
                value={entryForm.descripcion_entrada}
                onChange={(e) => setEntryForm({ ...entryForm, descripcion_entrada: e.target.value })}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEntryDialogOpen(false)}
            sx={{ color: colors.grey[100] }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleEntrySubmit} 
            variant="contained"
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              '&:hover': { backgroundColor: colors.greenAccent[700] }
            }}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Dialog */}
      <Dialog 
        open={exitDialogOpen} 
        onClose={() => setExitDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Registrar Salida</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={exitForm.cantidad_salida}
                onChange={(e) => setExitForm({ ...exitForm, cantidad_salida: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                value={exitForm.fecha_salida}
                onChange={(e) => setExitForm({ ...exitForm, fecha_salida: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Motivo de Salida</InputLabel>
                <Select
                  value={exitForm.id_motivo_salida}
                  onChange={(e) => setExitForm({ ...exitForm, id_motivo_salida: e.target.value })}
                >
                  {MOTIVOS_SALIDA.map((motive) => (
                    <MenuItem key={motive.id_motivo_salida} value={motive.id_motivo_salida}>
                      {motive.nombre_motivo_salida}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Justificación"
                value={exitForm.justificacion_salida}
                onChange={(e) => setExitForm({ ...exitForm, justificacion_salida: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observación"
                value={exitForm.observacion_salida}
                onChange={(e) => setExitForm({ ...exitForm, observacion_salida: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={4}
                value={exitForm.descripcion_salida}
                onChange={(e) => setExitForm({ ...exitForm, descripcion_salida: e.target.value })}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setExitDialogOpen(false)}
            sx={{ color: colors.grey[100] }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleExitSubmit} 
            variant="contained"
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              '&:hover': { backgroundColor: colors.greenAccent[700] }
            }}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Bottom navigation */}
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={() => navigate('/inventario')}
          sx={{
            backgroundColor: colors.blueAccent[600],
            color: colors.grey[100],
            marginRight: "10px",
            '&:hover': {
              backgroundColor: colors.blueAccent[700],
            }
          }}
        >
          Volver al Inventario
        </Button>
      </Box>
    </Box>
  );
};

export default VerProducto;