import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import HomeScreen from "../screens/HomeScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";

const Stack = createStackNavigator();

const UnverifiedStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

const VerifiedStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default function UserStack() {
  const auth = getAuth();
  /*
  return auth.currentUser.emailVerified ? (
    <NavigationContainer>
      <VerifiedStack />
    </NavigationContainer>
  ) : (
    <NavigationContainer>
      <UnverifiedStack />
    </NavigationContainer>
  );
  */

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
