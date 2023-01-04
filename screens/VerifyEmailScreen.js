import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import React from "react";
import {
  getAuth,
  signOut,
  sendEmailVerification,
  IdTokenResult,
  getIdTokenResult,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/core";

import HomeScreen from "../screens/HomeScreen";

const VerifyEmailScreen = () => {
  const auth = getAuth();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text>VerifyEmailScreen</Text>
      <Text>Verified: {String(auth.currentUser?.emailVerified)}</Text>
      <TouchableOpacity
        onPress={() => signOut(auth)}
        style={[styles.button, styles.buttonOutline]}
      >
        <Text style={styles.buttonOutlineText}>Return to Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.replace("Verified", { screen: "Home" });
        }}
        style={[styles.button, styles.buttonOutline]}
      >
        <Text style={styles.buttonOutlineText}>Go to HomeScreen</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          sendEmailVerification(auth.currentUser, {
            url: "https://kskfyp.firebaseapp.com",
            handleCodeInApp: true,
          }).catch((error) => {
            alert(error.message);
          });
        }}
        style={[styles.button, styles.buttonOutline]}
      >
        <Text style={styles.buttonOutlineText}>Send Again After 60s</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          auth.currentUser
            .reload()
            .then(() => {
              auth.currentUser.getIdToken(true);
            })
            .then(() => {
              if (auth.currentUser?.emailVerified) {
                navigation.replace("Verified", { screen: "Home" });
              } else {
                Alert.alert(
                  "Email Not Verified!",
                  "Please retry or resend the verification email!"
                );
              }
            });
        }}
        style={[styles.button, styles.buttonOutline]}
      >
        <Text style={styles.buttonOutlineText}>I have verified</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyEmailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#0782F9",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "#0782F9",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
});
