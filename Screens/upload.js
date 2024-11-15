import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";

const ImageGallerySelection = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [tab, setTab] = useState("Recientes");

  const selectImages = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 0,
    });
    if (!result.didCancel && result.assets) {
      setImages(result.assets);
    }
  };

  const handleTabChange = (selectedTab) => {
    setTab(selectedTab);
  };

  const handleConfirmSelection = () => {
    console.log("Imágenes seleccionadas:", images);
    navigation.goBack();
  };

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

      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.uri }} style={styles.image} />
          </View>
        )}
      />

      <TouchableOpacity style={styles.selectButton} onPress={selectImages}>
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
