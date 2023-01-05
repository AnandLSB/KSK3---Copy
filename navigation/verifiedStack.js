import { View, Text } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Test from "../screens/test";
import ForumScreen from "../screens/ForumScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function Profile() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Forum" component={ForumScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const VerifiedStack = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen
          name="ProfileComp"
          component={Profile}
          options={{ headerShown: false }}
        />
        <Stack.Screen name={"Test"} component={Test} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default VerifiedStack;
