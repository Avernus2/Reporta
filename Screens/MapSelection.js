import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const LocationSelectionScreen = ({ navigation }) => {
  const route = useRoute();
  const [location, setLocation] = React.useState(
    route.params?.maplocation || null
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false); // Estado para manejar el estado de carga del mapa

  const handleMapPress = (event) => {
    setLocation(event.nativeEvent.coordinate);
  };

  const handleConfirmLocation = (maplocation) => {
    navigation.navigate("Details", { params: { maplocation } });
  };

  const handleMapLoaded = () => {
    setIsMapLoaded(true); // Se actualiza el estado cuando el mapa se carga completamente
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar Ubicación en el Mapa</Text>

      {/* Mostrar el indicador de carga mientras el mapa no esté cargado */}
      {!isMapLoaded && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text>Cargando mapa...</Text>
        </View>
      )}

      {/* Mostrar el mapa una vez esté cargado */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -35.4409,
          longitude: -71.6543,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
        onMapLoaded={handleMapLoaded} // Este evento se dispara cuando el mapa se ha cargado
      >
        {location && <Marker coordinate={location} />}
      </MapView>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          navigation.popTo("Details", { maplocation: location });
        }}
        disabled={!location}
      >
        <Text style={styles.confirmButtonText}>Confirmar Ubicación</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  map: {
    width: "100%",
    height: "70%",
  },
  confirmButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007BFF",
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 20,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1,
  },
});

export default LocationSelectionScreen;
