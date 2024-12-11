import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getData } from "../http/index";
import * as Location from "expo-location";

const HomeScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState({
    latitude: -35.4409,
    longitude: -71.6543,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [filters, setFilters] = useState({
    reparaciones: false,
    baches: true,
    obrasPublicas: true,
    callesInundadas: true,
    cercaDeMiUbicacion: true,
  });
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Estado del modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const handleMarkerPress = (report) => {
    setSelectedReport(report); // Establece el reporte seleccionado
    setModalVisible(true); // Muestra el modal
  };
  // Asegúrate de actualizar los filtros cuando se navega de vuelta desde FiltersScreen
  useEffect(() => {
    if (route.params?.filters) {
      setFilters(route.params.filters); // Actualiza los filtros cuando se reciban
    }
  }, [route.params?.filters]);

  const handleDetailPress = () => {
    navigation.navigate("Details");
  };
  const handleFilterPress = () => {
    navigation.navigate("filtros", { filters }); // Pasa los filtros actuales
  };
  const obtenerUbicacionActual = async () => {
    // Solicitar permisos de ubicación
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Por favor, otorga los permisos de ubicación");
      return;
    }

    // Obtener la ubicación actual del usuario
    let location = await Location.getCurrentPositionAsync({});
    console.log("Ubicación del usuario:", location);

    return location.coords; // Devuelve las coordenadas
  };

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true); // Mostrar indicador de carga
      try {
        const result = await getData(); // Obtén los datos de Firebase o la API
        console.log("DATOS: ", result);

        if (result.success) {
          // Obtener la ubicación del usuario
          const location = await obtenerUbicacionActual();
          if (location) {
            const userLat = location.latitude;
            const userLon = location.longitude;
            console.log("Ubicación del usuario:", userLat, userLon);

            // Función para calcular la distancia usando la fórmula de Haversine
            const haversineDistance = (lat1, lon1, lat2, lon2) => {
              const toRad = (value) => (value * Math.PI) / 180;
              const R = 6371; // Radio de la Tierra en kilómetros
              const dLat = toRad(lat2 - lat1);
              const dLon = toRad(lon2 - lon1);
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) *
                  Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return R * c; // Distancia en kilómetros
            };

            // Filtrar los reportes según los filtros activos
            const filteredReports = result.reports.filter((marker) => {
              const matchesReportType =
                (filters.reparaciones &&
                  marker.reportType === "Reparaciones") ||
                (filters.baches && marker.reportType === "Baches") ||
                (filters.obrasPublicas &&
                  marker.reportType === "Obras Publicas") ||
                (filters.callesInundadas &&
                  marker.reportType === "Calles Inundadas");

              // Si ningún filtro de tipo de reporte está seleccionado, el reporte no pasa
              if (!matchesReportType) {
                return false;
              }

              // Verificar la ubicación si el filtro está activo
              if (filters.cercaDeMiUbicacion) {
                const markerLat = marker.location.latitude;
                const markerLon = marker.location.longitude;
                const distance = haversineDistance(
                  userLat,
                  userLon,
                  markerLat,
                  markerLon
                );

                // Si está fuera del rango de 5 km, descartar
                if (distance > 5) {
                  return false;
                }
              }

              return true; // Cumple con todos los filtros activos
            });

            console.log("Marcadores filtrados:", filteredReports); // Verifica el resultado del filtro
            setMarkers(filteredReports); // Actualiza los marcadores en el estado
          }
        } else {
          Alert.alert("Error", "No se pudieron obtener los datos de Firebase.");
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        Alert.alert("Error", "Ocurrió un problema al obtener los datos.");
      } finally {
        setIsLoading(false); // Ocultar indicador de carga
      }
    };

    fetchReports();
  }, [filters]); // Dependencias del useEffect

  // Dependencia en los filtros
  // Re-renderizar cuando los filtros cambian
  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {markers
            .filter(
              (marker) =>
                marker.location &&
                typeof marker.location.latitude === "number" &&
                typeof marker.location.longitude === "number"
            )
            .map((marker, index) => (
              <Marker
                key={marker.id}
                coordinate={{
                  latitude: marker.location.latitude,
                  longitude: marker.location.longitude,
                }}
                title={marker.description}
                onPress={() => handleMarkerPress(marker)} // Clic en el marcador
              />
            ))}
        </MapView>
      )}
      {/* Modal con los detalles del reporte */}
      {selectedReport && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedReport.title}</Text>
            <Text style={styles.modalDescription}>
              {selectedReport.description}
            </Text>
            <Text style={styles.modalSubtitle}>
              Tipo de reporte: {selectedReport.reportType}
            </Text>
            {console.log("Foto del reporte: ", selectedReport)}
            {selectedReport.imageUrl ? (
              <Image
                source={{ uri: selectedReport.imageUrl }}
                style={styles.modalImage}
              />
            ) : (
              <Text>No hay foto disponible</Text> // Si no hay foto, muestra un mensaje alternativo
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busca Aquí­"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity style={styles.iconButton} onPress={handleFilterPress}>
        <Icon name="filter-list" size={30} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={handleDetailPress}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%", position: "absolute" },
  searchContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 30,
    elevation: 3,
    zIndex: 2,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  buttonText: { color: "#FFFFFF", fontSize: 24 },
  modalContainer: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 10, // Sombra para dispositivos Android
    shadowColor: "#000", // Sombra para dispositivos iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24, // Un tamaño ligeramente mayor para destacarlo más
    fontWeight: "700", // Aumentar el grosor para hacerlo más prominente
    color: "#4A90E2", // Un color más vibrante, puedes cambiarlo según tu esquema de colores
    marginBottom: 15, // Espacio debajo del título
    textAlign: "center", // Centrar el texto
    textTransform: "uppercase", // Convertir a mayúsculas para mayor impacto
    letterSpacing: 1, // Espaciado entre letras para mejorar la legibilidad
    paddingHorizontal: 10, // Agregar algo de relleno lateral para que no esté pegado al borde
    borderBottomWidth: 2, // Línea en la parte inferior del título para hacerlo más destacado
    borderBottomColor: "#4A90E2", // Color de la línea inferior, puedes ajustarlo al esquema de colores
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333", // Ajusta el color según tu diseño
  },
  modalDescription: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
    lineHeight: 24,
  },
  modalImage: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
    resizeMode: "cover",
  },
  noImageText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  closeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default HomeScreen;
