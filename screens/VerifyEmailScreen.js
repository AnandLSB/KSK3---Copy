import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
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
  const [time, setTime] = React.useState(0);
  const [disabled, setDisabled] = React.useState(false);

  const startTimer = () => {
    //setTime(time + 1);
    setDisabled(true);
    setTimeout(() => {
      setDisabled(false);
    }, 60000);
  };

  React.useEffect(() => {
    startTimer();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", padding: 10, paddingVertical: 40 }}>
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          A verification email has been sent to your registered email, please
          check your email to verify your Kechara Soup Kitchen Volunteer
          Account!
        </Text>
      </View>
      <View style={styles.buttonContainer}>
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
          disabled={disabled}
          onPress={async () => {
            await sendEmailVerification(auth.currentUser, {
              url: "https://kskfyp.firebaseapp.com",
              handleCodeInApp: true,
            }).catch((error) => {
              alert(error.message);
            });
            startTimer();
            alert("Verification email sent!");
          }}
          style={
            disabled
              ? [styles.button, styles.buttonOutlineDisabled]
              : [styles.button, styles.buttonOutline]
          }
        >
          <Text
            style={
              disabled
                ? styles.buttonOutlineTextDisabled
                : styles.buttonOutlineText
            }
          >
            Resend Verification Email
          </Text>
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
    </View>
  );
};

export default VerifyEmailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e55039",
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
    borderColor: "black",
    borderWidth: 2,
  },
  buttonOutlineDisabled: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "#808080",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonOutlineTextDisabled: {
    color: "#808080",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonContainer: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
});
