import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialIcons";
import { launchCameraAsync, useCameraPermissions } from "expo-image-picker";
import { Camera } from "expo-camera";
import { sendReport } from "../http/index";

const DetailsScreen = ({ route, navigation }) => {
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [reportDescription, setReportDescription] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  const handleSelectionPress = () => {
    navigation.navigate("select");
  };
  const handleUploadPress = () => {
    navigation.navigate("Upload");
  };

  React.useEffect(() => {
    if (route.params?.maplocation) {
      console.log("ubicacion recibida correctamente: ");
    }
  }, [route.params?.maplocation]);

  const handleSubmit = async () => {
    try {
      if (imageUri) {
        const reportData = {
          reportType: selectedReportType,
          description: reportDescription,
          imageUrl: null,
          location: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
              }
            : route.params?.maplocation,
          timestamp: new Date().toISOString(),
        };

        const result = await sendReport(reportData);

        if (result.success) {
          console.log("Éxito", "Reporte enviado con éxito");
          navigation.navigate("Reportalo");
        } else {
          console.error("Error al enviar el reporte:", result.error);
          console.log(
            "Error",
            "Hubo un error al enviar el reporte. Por favor, intenta de nuevo."
          );
        }
      } else {
        console.log("Error", "No se ha proporcionado una imagen.");
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      console.log(
        "Error",
        "Hubo un error al enviar el reporte. Por favor, intenta de nuevo"
      );
    }
  };

  async function verifyPermission() {
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status === "undetermined") {
      const { status: newStatus } =
        await Camera.requestCameraPermissionsAsync();
      return newStatus === "granted";
    }

    if (status === "denied") {
      alert("Necesitas permisos de la cámara");
      return false;
    }

    return status === "granted";
  }

  const takeImageHandler = async () => {
    const hasPermission = await verifyPermission();
    if (!hasPermission) {
      return;
    }

    const result = await launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={takeImageHandler}
          >
            <Icon name="photo-camera" size={30} color="#000" />
            <Text style={styles.iconText}>Tomar fotografía</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleUploadPress}
          >
            <Icon name="photo" size={30} color="#000" />
            <Text style={styles.iconText}>Subir imagen/fotografía</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSelectionPress}
            value={route.params?.maplocation}
          >
            <Icon name="place" size={30} color="#000" />
            <Text style={styles.iconText}>Seleccionar ubicación</Text>
          </TouchableOpacity>
          {route.params?.maplocation && (
            <Text style={styles.selectedText}>
              Ubicación seleccionada:{" "}
              {
                (route.params?.maplocation.longitude,
                route.params?.maplocation.latitude)
              }
            </Text>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={getCurrentLocation}
          >
            <Icon name="my-location" size={30} color="#000" />
            <Text style={styles.iconText}>Utilizar ubicación actual</Text>
          </TouchableOpacity>
        </View>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
        {location && (
          <Text style={styles.locationText}>
            Ubicación: {location.latitude}, {location.longitude}
          </Text>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => console.log("Cancelar reporte")}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Enviar Reporte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
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
  iconContainer: {
    marginBottom: 20,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconText: {
    marginLeft: 10,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    padding: 15,
    backgroundColor: "#ccc",
    alignItems: "center",
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  submitButton: {
    padding: 15,
    backgroundColor: "#007BFF",
    alignItems: "center",
    borderRadius: 5,
    flex: 1,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
  locationText: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default DetailsScreen;
