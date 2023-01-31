import "react-native-gesture-handler";

import * as React from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import messaging from "@react-native-firebase/messaging";
import * as RootNavigation from "./RootNavigation";

import AuthStack from "./navigation/authStack";
import Splash from "./screens/Splash";

import UnverifiedStack from "./navigation/unverifiedStack";
import VerifiedStack from "./navigation/verifiedStack";

const Stack = createStackNavigator();
const auth = getAuth();

function App() {
  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = React.useState();

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  };

  function onAuthStateChange(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, onAuthStateChange);

    if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((token) => {
          console.log(token);
        });
    } else {
      console.log("Permission rejected");
    }

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
        }
      });

    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
      RootNavigation.navigate("ForumDetails", {
        forumId: remoteMessage.data.forumId,
      });
    });

    // Register background handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
    });

    const unsubscribeFore = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });

    return unsubscribeAuth, unsubscribeFore;
  }, []);

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
