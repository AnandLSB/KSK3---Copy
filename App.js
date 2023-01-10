import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import AuthStack from "./navigation/authStack";
import Splash from "./screens/Splash";

import UnverifiedStack from "./navigation/unverifiedStack";
import VerifiedStack from "./navigation/verifiedStack";

const Stack = createStackNavigator();
const auth = getAuth();

function App() {
  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = React.useState();

  function onAuthStateChange(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, onAuthStateChange);
    return unsubscribe;
  }, []);

  //maybe we can replace this with a splash screen?
  if (initializing) return <Splash />;

  if (!user) {
    return <AuthStack />; //no user session
  } else if (user && !user.emailVerified) {
    return <UnverifiedStack />; // unverified email user session
  } else if (user && user.emailVerified) {
    return <VerifiedStack />; //verified email user session
  }
}

export default () => {
  return <App />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
