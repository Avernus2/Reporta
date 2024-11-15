import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./Screens/home";
import DetailsScreen from "./Screens/DetailsScreen";
import FiltersScreen from "./Screens/filtros";
import LocationSelection from "./Screens/MapSelection";
import ImageGallerySelection from "./Screens/upload";
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Reportalo"
          options={{ headerShown: false }}
          component={HomeScreen}
        />
        <Stack.Screen name="filtros" component={FiltersScreen} />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          initialParams={{ maplocation: "" }}
        />
        <Stack.Screen name="Upload" component={ImageGallerySelection} />
        <Stack.Screen name="select" component={LocationSelection} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
