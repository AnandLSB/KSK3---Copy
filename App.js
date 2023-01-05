import * as React from "react";
//import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
//import { useAuthentication } from "./useAuth";

//import RootNavigation from "./navigation/nav";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";

import UserStack from "./navigation/userStack";
import AuthStack from "./navigation/authStack";
import Splash from "./screens/Splash";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
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

  /*
  React.useEffect(() => {
    const unsubscribeFromAuthStateChanged = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        setUser(user);
        //if (initializing) setInitializing(false);
      } else {
        // User is signed out
        setUser(undefined);
      }
    });

    return unsubscribeFromAuthStateChanged;
  }, []);
  */

  //maybe we can replace this with a splash screen?
  if (initializing) return <Splash />;

  if (!user) {
    return <AuthStack />; //no user session
  } else if (user && !user.emailVerified) {
    return <UnverifiedStack />; // unverified email user session
  } else if (user && user.emailVerified) {
    return <VerifiedStack />; //verified email user session
  }

  //return <UserStack />

  //return user ? <UserStack /> : <AuthStack />;
  //return (
  /*
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    */
  //<RootNavigation />
  //);
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
