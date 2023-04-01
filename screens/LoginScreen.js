import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";
import { auth } from "../config/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { db } from "../config/firebase";
import messaging from "@react-native-firebase/messaging";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth();
  const navigation = useNavigation();

  const subscribeForums = (userID) => {
    const userRef = doc(db, "volunteer", userID);

    getDoc(userRef).then((userDoc) => {
      if (userDoc.data().myForums.length > 0) {
        userDoc.get("myForums").forEach((forumItem) => {
          messaging().subscribeToTopic(forumItem);
          console.log("Subscribed to forum " + forumItem);
        });
      }
    });
  };

  const subscribeActivities = (userID) => {
    const userRef = doc(db, "volunteer", userID);

    getDoc(userRef).then((userDoc) => {
      if (userDoc.data().myActivities.length > 0) {
        userDoc.get("myActivities").forEach((activityItem) => {
          messaging().subscribeToTopic(activityItem);
          console.log("Subscribed to activity " + activityItem);
        });
      }
    });
  };

  const handleSignIn = () => {
    const collectionRef = collection(db, "volunteer");
    const q = query(collectionRef, where("email", "==", email.toLowerCase()));

    getDocs(q).then((snapshot) => {
      if (snapshot.docs.length === 0) {
        Alert.alert("Error!", "User not found");
      } else {
        signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            subscribeForums(auth.currentUser.uid);
            subscribeActivities(auth.currentUser.uid);
          })
          .catch((error) => {
            if (error.code === "auth/user-not-found") {
              Alert.alert("Error!", "User not found");
            } else if (error.code === "auth/wrong-password") {
              Alert.alert("Error!", "Wrong password");
            } else {
              alert(error.message);
            }
          });
      }
    });
  };

  const handlePassReset = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Password Reset Email Sent!", "Please check your email");
      })
      .catch((error) => {
        if (error.code === "auth/invalid-email") {
          Alert.alert("Error!", "Invalid email");
        } else if (error.code === "auth/user-not-found") {
          Alert.alert("Error!", "User not found");
        } else {
          alert(error.message);
        }
      });
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <Image
          source={require("../assets/kskLogo.png")}
          style={{ width: 165, height: 165 }}
        />
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
          Kechara Soup Kitchen
        </Text>
        <Text style={{ color: "white", fontWeight: "normal" }}>
          Login as a Volunteer at Kechara Soup Kitchen
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            if (email === "" || password === "") {
              Alert.alert("Error!", "Please fill in all fields");
            } else {
              handleSignIn();
            }
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.text}>Don't Have an Account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={{ fontWeight: "bold", color: "#FFFFFF" }}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (email === "") {
              Alert.alert("Error!", "Please fill in your email");
            } else {
              Alert.alert(
                "Reset Password?",
                "A password reset email will be sent to your email address!",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                  },
                  { text: "OK", onPress: () => handlePassReset() },
                ]
              );
            }
          }}
        >
          <Text style={{ fontWeight: "bold", color: "#FFFFFF" }}>
            Forgot Password
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e55039",
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#F9E7E8",
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
  buttonText: {
    color: "#20130B",
    fontWeight: "500",
    fontSize: 16,
  },
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    marginTop: 20,
  },
  text: {
    color: "#FFFFFF",
  },
});
