import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import VerifiedStack from "./verifiedStack";

const Stack = createStackNavigator();

const Verified = () => {
  return <VerifiedStack />;
};

const UnverifiedStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Verified"
          component={Verified}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default UnverifiedStack;

const styles = StyleSheet.create({});
