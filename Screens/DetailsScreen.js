import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import * as Location from "expo-location"; // Importamos expo-location en lugar de Geolocation

const DetailsScreen = () => {
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [reportDescription, setReportDescription] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);

  const reportTypes = [
    { label: "Reparaciones", value: "reparaciones" },
    { label: "Baches", value: "baches" },
    { label: "Obras Públicas", value: "obras_publicas" },
    { label: "Calles inundadas", value: "calles_inundadas" },
    { label: "Cerca de mi Ubicación", value: "cerca_ubicacion" },
  ];

  const handleReportTypeSelection = (value) => {
    setSelectedReportType(value);
  };

  const handleDescriptionChange = (text) => {
    setReportDescription(text);
  };

  const handleSubmit = () => {
    // Handle report submission logic here
    console.log("Selected Report Type:", selectedReportType);
    console.log("Report Description:", reportDescription);
  };

  const takePhoto = async () => {
    const result = await launchCamera({
      mediaType: "photo",
    });
    if (!result.didCancel) {
      setImageUri(result.assets[0].uri);
    }
  };

  const selectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
    });
    if (!result.didCancel) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Función para obtener la ubicación actual con expo-location
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permiso de ubicación denegado");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar tipo de reporte</Text>
      <View style={styles.reportTypes}>
        {reportTypes.map((reportType) => (
          <TouchableOpacity
            key={reportType.value}
            style={styles.reportTypeButton}
            onPress={() => handleReportTypeSelection(reportType.value)}
          >
            <View style={styles.checkbox}>
              {selectedReportType === reportType.value && (
                <View style={styles.checkedIcon} />
              )}
            </View>
            <Text style={styles.reportTypeLabel}>{reportType.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.title}>Descripción</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder="Descripción de reporte"
        multiline={true}
        value={reportDescription}
        onChangeText={handleDescriptionChange}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Cámara y Ubicación en React Native</Text>
        <TouchableOpacity onPress={takePhoto} style={styles.button}>
          <Text style={styles.buttonText}>Tomar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={selectImage} style={styles.button}>
          <Text style={styles.buttonText}>Seleccionar Imagen</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={getCurrentLocation} style={styles.button}>
          <Text style={styles.buttonText}>Obtener Ubicación Actual</Text>
        </TouchableOpacity>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
        {location && (
          <Text style={styles.locationText}>
            Ubicación: {location.latitude}, {location.longitude}
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Enviar Reporte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reportTypes: {
    marginBottom: 20,
  },
  reportTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedIcon: {
    width: 12,
    height: 12,
    backgroundColor: "#000",
  },
  reportTypeLabel: {
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  actionButtons: {
    alignItems: "flex-end",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DetailsScreen;
