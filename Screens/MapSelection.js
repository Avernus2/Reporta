import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";

const LocationSelectionScreen = ({ navigation }) => {
  const route = useRoute();
  const [location, setLocation] = React.useState(
    route.params?.maplocation || null
  );

  const handleMapPress = (event) => {
    setLocation(event.nativeEvent.coordinate);
  };

  const handleConfirmLocation = (maplocation) => {
    navigation.navigate("Details", { params: { maplocation } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar Ubicación en el Mapa</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -35.4409,
          longitude: -71.6543,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
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
});

export default LocationSelectionScreen;
