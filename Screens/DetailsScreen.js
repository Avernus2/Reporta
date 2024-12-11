import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialIcons";
import { launchCameraAsync, useCameraPermissions } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { sendReport } from "../http/index";
import axios from "axios";

const DetailsScreen = ({ route, navigation }) => {
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [reportDescription, setReportDescription] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const reportTypes = [
    { label: "Reparaciones", value: "Reparaciones" },
    { label: "Baches", value: "Baches" },
    { label: "Obras Públicas", value: "Obras Publicas" },
    { label: "Calles inundadas", value: "Calles Inundadas" },
    { label: "Cerca de mi Ubicación", value: "Cerca de mi Ubicación" },
  ];

  const handleReportTypeSelection = (value) => {
    setSelectedReportType(value);
  };

  const handleDescriptionChange = (text) => {
    setReportDescription(text);
  };
  const handleTitleChange = (text) => {
    // Nueva función para el título
    setReportTitle(text);
  };

  const handleSelectionPress = () => {
    navigation.navigate("select");
  };
  const handleUploadPress = () => {
    // Ya no necesitas navegar a otra pantalla, directamente se selecciona la imagen
    handleImagePicker();
  };

  const handleImagePicker = async () => {
    // Solicitar permisos para acceder a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Se requiere acceso a la galería para continuar"
      );
      return;
    }

    // Abrir la galería para seleccionar una imagen
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Permite editar la imagen antes de seleccionarla
      quality: 1, // Establece la calidad de la imagen
      selectionLimit: 1, // Limita la selección a 1 imagen
    });

    // Verifica si el usuario no canceló la selección y guarda la imagen
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri; // Accede correctamente al URI de la primera imagen
      setImageUri(imageUri); // Almacena solo la URI de la imagen seleccionada
    } else {
      Alert.alert(
        "Selección cancelada",
        "No se ha seleccionado ninguna imagen."
      );
    }
  };

  React.useEffect(() => {
    if (route.params?.maplocation) {
      console.log("ubicacion recibida correctamente: ");
    }
  }, [route.params?.maplocation]);

  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg", // Verifica si el tipo correcto es image/jpeg o image/png
      name: "photo.jpg", // O el nombre del archivo
    });
    formData.append("upload_preset", "reportalo"); // Asegúrate de que este preset sea correcto

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/datdiejvy/image/upload", // Reemplaza con tu nombre de Cloudinary
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Imagen subida exitosamente:", response.data);
      return response.data.secure_url; // Devuelve la URL de la imagen subida
    } catch (error) {
      console.error(
        "Error al subir la imagen:",
        error.response?.data || error.message
      );
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedReportType || !reportTitle || !reportDescription) {
        console.log("Error", "Por favor completa todos los campos.");
        return;
      }

      let imageUrl = null;
      if (imageUri) {
        imageUrl = await uploadImageToCloudinary(imageUri); // Subir la imagen a Cloudinary
      }

      if (!imageUrl) {
        console.log("Error", "No se ha podido subir la imagen.");
        return;
      }

      const reportData = {
        title: reportTitle,
        reportType: selectedReportType,
        description: reportDescription,
        location: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          : route.params?.maplocation,
        timestamp: new Date().toISOString(),
        imageUrl, // Agregar la URL de la imagen subida
      };

      // Aquí envías el reporte a tu servidor
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
        <Text style={styles.title}>Título del Reporte</Text>
        <TextInput
          style={styles.titleInput} // Estilo para el título
          placeholder="Escribe el título del reporte"
          value={reportTitle}
          onChangeText={handleTitleChange} // Cambia el estado del título
        />
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
  titleInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
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
