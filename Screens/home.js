import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getData } from "../http/index";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState({
    latitude: -35.4409,
    longitude: -71.6543,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState([]);

  const handleDetailPress = () => {
    navigation.navigate("Details");
  };
  const handleFilterPress = () => {
    navigation.navigate("filtros");
  };
  useEffect(() => {
    const fetchReports = async () => {
      const result = await getData();
      if (result.success) {
        setMarkers(result.reports);
        console.log("resultados de la base de datos:  ", result);
      } else {
        Alert.alert("Error", "No se pudieron obtener los datos de Firebase.");
      }
    };

    fetchReports();
  }, []);

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
            key={marker.id}
            coordinate={{
              latitude: marker.location.latitude,
              longitude: marker.location.longitude,
            }}
            title={marker.description}
          />
        ))}
      </MapView>
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
