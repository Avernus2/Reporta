import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";

const ImageGallerySelection = () => {
  const [images, setImages] = useState([]); // Cambiar a un array para manejar múltiples imágenes
  const [tab, setTab] = useState("Recientes"); // Agregar estado para pestaña activa

  // Función para manejar la selección de imagen
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
    });

    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, result.assets[0].uri]); // Agregar nuevas imágenes
    }
  };

  // Cambio de pestaña entre 'Recientes' y 'Galeria'
  const handleTabChange = (selectedTab) => {
    setTab(selectedTab);
  };

  // Confirmar la selección de imágenes y navegar hacia atrás
  const handleConfirmSelection = () => {
    console.log("Imágenes seleccionadas:", images);
    // Aquí deberías realizar alguna acción con las imágenes seleccionadas
    // navigation.goBack(); // Si tienes navegación, descomentar esta línea
  };

  useEffect(() => {
    console.log("Estado actualizado de imágenes:", images); // Verifica el estado
  }, [images]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seleccionar</Text>
        <TouchableOpacity onPress={handleConfirmSelection}>
          <Icon name="check-box" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "Recientes" && styles.activeTab]}
          onPress={() => handleTabChange("Recientes")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "Recientes" && styles.activeTabText,
            ]}
          >
            Recientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "Galeria" && styles.activeTab]}
          onPress={() => handleTabChange("Galeria")}
        >
          <Text
            style={[styles.tabText, tab === "Galeria" && styles.activeTabText]}
          >
            Galeria
          </Text>
        </TouchableOpacity>
      </View>

      {/* Muestra las imágenes seleccionadas */}
      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => {
          console.log("Imagen actual:", item); // Verifica el contenido de cada imagen
          return (
            <View style={styles.imageContainer}>
              {item ? (
                <Image source={{ uri: item }} style={styles.image} />
              ) : (
                <Text>No se pudo cargar la imagen</Text>
              )}
            </View>
          );
        }}
      />

      {/* Botón para seleccionar más imágenes */}
      <TouchableOpacity style={styles.selectButton} onPress={handleImagePicker}>
        <Text style={styles.selectButtonText}>Seleccionar Imágenes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tabButton: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007BFF",
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  imageContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  selectButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007BFF",
    alignItems: "center",
    borderRadius: 5,
  },
  selectButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ImageGallerySelection;
