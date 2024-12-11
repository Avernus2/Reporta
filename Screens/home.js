import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getData } from "../http/index";

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

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true); // Mostrar indicador de carga
      try {
        const result = await getData(); // Obtén los datos de Firebase o la API
        console.log("DATOS: ", result);

        if (result.success) {
          // Filtrar los reportes según los filtros seleccionados
          const filteredReports = result.reports.filter((marker) => {
            // Aplica los filtros activos
            if (filters.reparaciones && marker.reportType === "reparaciones")
              return true;
            if (filters.baches && marker.reportType === "baches") return true;
            if (
              filters.callesInundadas &&
              marker.reportType === "calles_inundadas"
            )
              return true;
            if (filters.cercaDeMiUbicacion) {
              // Agrega lógica adicional para filtrar por ubicación, si es necesario
              return true; // Cambia esta lógica si es específica
            }
            return false; // Excluye marcadores que no coincidan con ningún filtro activo
          });

          console.log("Marcadores filtrados:", filteredReports); // Verifica el resultado del filtro
          setMarkers(filteredReports); // Actualiza los marcadores en el estado
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
  }, [filters]); // Dependencia en los filtros
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
              />
            ))}
        </MapView>
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
});

export default HomeScreen;
