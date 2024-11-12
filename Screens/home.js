import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState({
    latitude: -35.4409, // Talca, Chile
    longitude: -71.6543,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const markers = [
    {
      coordinate: { latitude: -35.4421, longitude: -71.6548 },
      title: "Plaza de Armas Talca",
    },
  ];
  const handleDetailPress = () => {
    navigation.navigate("Details"); // Navega a la pantalla de login
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
          />
        ))}
      </MapView>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busca Aquí"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
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
