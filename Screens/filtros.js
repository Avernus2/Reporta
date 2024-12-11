import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";

const FiltersScreen = ({ navigation, route }) => {
  const [filters, setFilters] = useState(
    route.params?.filters || {
      reparaciones: false,
      baches: true,
      obrasPublicas: true,
      callesInundadas: true,
      cercaDeMiUbicacion: true,
    }
  );

  const toggleFilter = (filter) => {
    setFilters({
      ...filters,
      [filter]: !filters[filter],
    });
  };

  const handleContinue = () => {
    console.log("Continuar presionado con los siguientes filtros:", filters);

    // Pasar los filtros seleccionados como parámetros al componente anterior
    navigation.navigate("Reportalo", { filters });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtros</Text>
      {Object.keys(filters).map((filterKey) => (
        <View key={filterKey} style={styles.filterItem}>
          <Switch
            value={filters[filterKey]}
            onValueChange={() => toggleFilter(filterKey)}
          />
          <Text style={styles.filterText}>
            {filterKey.charAt(0).toUpperCase() +
              filterKey.slice(1).replace(/([A-Z])/g, " $1")}
          </Text>
        </View>
      ))}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  filterText: {
    marginLeft: 10,
    fontSize: 16,
  },
  continueButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#00C07F",
    alignItems: "center",
    borderRadius: 5,
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default FiltersScreen;
