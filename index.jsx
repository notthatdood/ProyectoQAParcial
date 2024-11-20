import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Link, useNavigate } from "react-router-dom";

const Inventario = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [filter, setFilter] = useState("Todo");
  const navigate = useNavigate();
  const [suministros, setSuministros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch suministros from the backend
  const getSuministros = async () => {
    try {
      const response = await fetch(
        "https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getSuministros",
        {
          method: "POST", // Use POST as per your backend requirement
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // Send empty body if required
        }
      );

      if (!response.ok) {
        // Try to parse the error message from the response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignore JSON parsing error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Fetched suministros:", data);

      setSuministros(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching suministros:", err);
      setError("Hubo un error al obtener los suministros.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getSuministros();
  }, []);

  // Handler to view a specific suministro
  const handleVerProducto = (id_suministro) => {
    navigate(`/view/verProducto?id=${id_suministro}`);
  };

  const handleDelete = (id) => {
    // Lógica para eliminar un producto del inventario
    console.log(`Delete item with ID: ${id}`);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Apply filter to suministros
  const filteredSuministros = suministros.filter((item) => {
    switch (filter) {
      case "Baja cantidad":
        return parseFloat(item.cantidad_disponible) < 10;
      case "Sin elementos":
        return parseFloat(item.cantidad_disponible) === 0;
      case "Expirado":
        // Assuming you have a 'fecha_vencimiento' field
        return new Date(item.fecha_vencimiento) < new Date();
      default:
        return true;
    }
  });

  return (
    <Box m="20px">
      {/* Header and Buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Inventario"
          subtitle="Lista de productos en el inventario"
        />
        <Box display="flex" gap="20px">
          {/* Agregar Producto Button */}
          <Link to="/form/crearProducto" style={{ textDecoration: "none" }}>
            <Button
              sx={{
                backgroundColor: colors.greenAccent[500],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "12px",
                "&:hover": {
                  backgroundColor: "#ff3b6d",
                  color: "white",
                },
              }}
            >
              <AddOutlinedIcon sx={{ mr: "10px" }} />
              Agregar Producto
            </Button>
          </Link>

          {/* Agregar Proveedor Button */}
          <Link to="/form/crearProveedor" style={{ textDecoration: "none" }}>
            <Button
              sx={{
                backgroundColor: colors.greenAccent[500],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "12px",
                "&:hover": {
                  backgroundColor: "#ff3b6d",
                  color: "white",
                },
              }}
            >
              <AddOutlinedIcon sx={{ mr: "10px" }} />
              Agregar Proveedor
            </Button>
          </Link>

          {/* Ver Estadísticas Button */}
          <Link to="/view/verEstadisticas" style={{ textDecoration: "none" }}>
            <Button
              sx={{
                backgroundColor: colors.greenAccent[500],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "12px",
                "&:hover": {
                  backgroundColor: "#ff3b6d",
                  color: "white",
                },
              }}
            >
              <AddOutlinedIcon sx={{ mr: "10px" }} />
              Ver Estadísticas
            </Button>
          </Link>

          {/* Filter Select */}
          <Select
            value={filter}
            onChange={handleFilterChange}
            displayEmpty
            inputProps={{ "aria-label": "Filter" }}
            sx={{
              backgroundColor: colors.primary[400],
              color: colors.grey[100],
              borderRadius: "12px",
            }}
          >
            <MenuItem value="Todo">Todo</MenuItem>
            <MenuItem value="Baja cantidad">Baja cantidad</MenuItem>
            <MenuItem value="Sin elementos">Sin elementos</MenuItem>
            <MenuItem value="Expirado">Expirado</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Loading, Error, and Table */}
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt="50px"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt="50px"
        >
          <Typography color="error.main">{error}</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table aria-label="suministros table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Nombre del Producto</strong>
                </TableCell>
                <TableCell>
                  <strong>Categoría</strong>
                </TableCell>
                <TableCell>
                  <strong>Tipo de Suministro</strong>
                </TableCell>
                <TableCell>
                  <strong>Unidad de Medición</strong>
                </TableCell>
                <TableCell>
                  <strong>Cantidad Disponible</strong>
                </TableCell>
                <TableCell>
                  <strong>Stock Mínimo</strong>
                </TableCell>
                <TableCell>
                  <strong>Fecha de Actualización</strong>
                </TableCell>
                <TableCell>
                  <strong>Nota</strong>
                </TableCell>
                <TableCell>
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuministros.map((suministro) => (
                <TableRow key={suministro.id_suministro}>
                  <TableCell>{suministro.id_suministro}</TableCell>
                  <TableCell>{suministro.nombre_suministro}</TableCell>
                  <TableCell>{suministro.id_categoria_suministro}</TableCell>
                  <TableCell>{suministro.id_tipo_suministro}</TableCell>
                  <TableCell>{suministro.id_unidad_medida}</TableCell>
                  <TableCell>{suministro.cantidad_disponible}</TableCell>
                  <TableCell>{suministro.stock_minimo}</TableCell>
                  <TableCell>
                    {new Date(
                      suministro.fecha_ultima_actualizacion
                    ).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{suministro.nota_suministro}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Button
                        color="primary"
                        sx={{ minWidth: "40px", marginRight: "5px" }}
                        onClick={() =>
                          navigate(
                            `/edit/editarInventario/${suministro.id_suministro}`
                          )
                        }
                      >
                        <EditOutlinedIcon />
                      </Button>
                      <Button
                        color="secondary"
                        sx={{ minWidth: "40px" }}
                        onClick={() => handleDelete(suministro.id_suministro)}
                      >
                        <DeleteOutlineIcon />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSuministros.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No hay suministros disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Inventario;
